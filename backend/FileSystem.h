#pragma once
#include <nlohmann/json.hpp>
#include <string>
#include <vector>

struct FileEntry {
  std::string path;
  std::string name;
  std::string parent_dir;
};

class FileSystem {
public:
  static std::vector<FileEntry> listFiles(const std::string &rootPath,
                                          int maxDepth = -1);
  static std::string readFile(const std::string &path);
  static bool saveFile(const std::string &path, const std::string &content);
};
