cmake_minimum_required(VERSION 3.10)
project(english_cards)

# Пути к заголовочным файлам
include_directories(
    ${PROJECT_SOURCE_DIR}/backend/include
)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Создаем исполняемый файл
add_executable(server 
    backend/main.cpp
    backend/cards.cpp)

# Для Windows
if(WIN32)
    target_link_libraries(server ws2_32)
endif()

# Копируем файл cards.json в директорию сборки
configure_file(
    ${PROJECT_SOURCE_DIR}/data/cards.json
    ${CMAKE_CURRENT_BINARY_DIR}/data/cards.json
    COPYONLY
)