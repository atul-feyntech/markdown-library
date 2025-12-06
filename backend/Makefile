CXX = clang++
CXXFLAGS = -std=c++17 -Wall -O2 -DASIO_STANDALONE
INCLUDES = -Ilib/Crow/include -Ilib/json/include -Ilib/asio/asio/include
TARGET = markdown-server
SRCS = main.cpp FileSystem.cpp

all: $(TARGET)

$(TARGET): $(SRCS)
	$(CXX) $(CXXFLAGS) $(INCLUDES) -o $(TARGET) $(SRCS) -lpthread

clean:
	rm -f $(TARGET)
