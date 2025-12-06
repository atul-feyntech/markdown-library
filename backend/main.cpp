#include "FileSystem.h"
#include "crow.h"
#include <cstdlib>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

// Get home directory from environment, fallback to /tmp
std::string getHomePath() {
  const char *home = std::getenv("HOME");
  return home ? std::string(home) : "/tmp";
}

const std::string ROOT_PATH = getHomePath();

int main() {
  crow::SimpleApp app;

  CROW_ROUTE(app, "/health")([]() { return "OK"; });

  CROW_ROUTE(app, "/api/files")
      .methods("GET"_method)([](const crow::request &req) {
        json j;
        j["files"] = json::array();

        // Get folders from query param, or use default
        std::string foldersParam =
            req.url_params.get("folders") ? req.url_params.get("folders") : "";

        std::vector<std::string> foldersToScan;
        if (foldersParam.empty()) {
          // Default: scan Repository root
          foldersToScan.push_back(ROOT_PATH);
        } else {
          // Parse comma-separated folder paths
          std::stringstream ss(foldersParam);
          std::string folder;
          while (std::getline(ss, folder, ',')) {
            if (!folder.empty()) {
              foldersToScan.push_back(folder);
            }
          }
        }

        // Scan all folders
        for (const auto &folderPath : foldersToScan) {
          auto files = FileSystem::listFiles(folderPath, 7);
          for (const auto &f : files) {
            j["files"].push_back(
                {{"path", f.path}, {"name", f.name}, {"folder", f.parent_dir}});
          }
        }

        crow::response res(j.dump());
        res.add_header("Access-Control-Allow-Origin", "*");
        return res;
      });

  CROW_ROUTE(app, "/api/file")
      .methods("GET"_method)([](const crow::request &req) {
        auto path = req.url_params.get("path");
        if (!path)
          return crow::response(400, "Missing path parameter");

        std::string content = FileSystem::readFile(path);
        json j;
        j["content"] = content;
        crow::response res(j.dump());
        res.add_header("Access-Control-Allow-Origin", "*");
        return res;
      });

  CROW_ROUTE(app, "/api/file")
      .methods("POST"_method)([](const crow::request &req) {
        auto x = json::parse(req.body);
        std::string path = x["path"];
        std::string content = x["content"];

        crow::response res;
        res.add_header("Access-Control-Allow-Origin", "*");

        if (FileSystem::saveFile(path, content)) {
          res.code = 200;
          res.body = "Saved";
        } else {
          res.code = 500;
          res.body = "Failed to save";
        }
        return res;
      });

  // Explicit CORS preflight for /api/file
  CROW_ROUTE(app, "/api/file")
      .methods("OPTIONS"_method)([](const crow::request &req) {
        crow::response res;
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.add_header("Access-Control-Allow-Headers", "Content-Type");
        res.code = 204;
        return res;
      });
  CROW_ROUTE(app, "/<path>")
      .methods("OPTIONS"_method)(
          [](const crow::request &req, crow::response &res, std::string path) {
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Access-Control-Allow-Methods",
                           "GET, POST, PUT, DELETE, OPTIONS");
            res.add_header("Access-Control-Allow-Headers", "Content-Type");
            res.end();
          });

  app.port(8080).multithreaded().run();
}
