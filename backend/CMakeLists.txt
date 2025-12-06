cmake_minimum_required(VERSION 3.14)
project(MarkdownLibraryBackend)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

include(FetchContent)

# Fetch Crow (C++ Microframework for Web)
FetchContent_Declare(
    crow
    GIT_REPOSITORY https://github.com/CrowCpp/Crow.git
    GIT_TAG        v1.2.0 # Use a stable tag
)
FetchContent_MakeAvailable(crow)

# Fetch nlohmann/json
FetchContent_Declare(
    json
    GIT_REPOSITORY https://github.com/nlohmann/json.git
    GIT_TAG        v3.11.3
)
FetchContent_MakeAvailable(json)

add_executable(markdown-server main.cpp)

target_link_libraries(markdown-server PRIVATE Crow::Crow nlohmann_json::nlohmann_json)
