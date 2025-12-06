#include "FileSystem.h"
#include <filesystem>
#include <fstream>
#include <iostream>
#include <sstream>

namespace fs = std::filesystem;

// Helper to count path depth relative to root
int getDepth(const fs::path &path, const fs::path &root) {
  auto rel = fs::relative(path, root);
  int d = 0;
  for (auto it = rel.begin(); it != rel.end(); ++it)
    d++;
  return d;
}

std::vector<FileEntry> FileSystem::listFiles(const std::string &rootPath,
                                             int maxDepth) {
  std::vector<FileEntry> entries;
  try {
    fs::path root(rootPath);
    if (!fs::exists(root))
      return entries;

    // Use custom recursive search to respect maxDepth
    auto options = fs::directory_options::follow_directory_symlink;

    for (const auto &entry : fs::recursive_directory_iterator(root, options)) {
      if (entry.is_regular_file() && entry.path().extension() == ".md") {
        if (maxDepth > -1) {
          int currentDepth = getDepth(entry.path(), root);
          // Depth is number of components relative to root.
          // If maxDepth is 7, we skip if depth > 7.
          // relative path "a/b/c.md" has depth 3 (a, b, c.md). folder depth
          // is 2. The user likely means folder depth. "a/b" is depth 2.
          if (currentDepth - 1 > maxDepth)
            continue;
        }

        entries.push_back({entry.path().string(),
                           entry.path().filename().string(),
                           entry.path().parent_path().string()});
      }
    }
  } catch (const std::exception &e) {
    std::cerr << "Error listing files: " << e.what() << std::endl;
  }
  return entries;
}

std::string FileSystem::readFile(const std::string &path) {
  std::ifstream f(path);
  if (!f.is_open())
    return "";
  std::stringstream buffer;
  buffer << f.rdbuf();
  return buffer.str();
}

bool FileSystem::saveFile(const std::string &path, const std::string &content) {
  std::ofstream f(path);
  if (!f.is_open())
    return false;
  f << content;
  return true;
}
