cmake_minimum_required(VERSION 3.10)
project(english_cards)

# Указываем путь к заголовкам
include_directories(backend/include)

# Создаем исполняемый файл
add_executable(server 
    backend/main.cpp
    backend/cards.cpp)

# Для Windows
if(WIN32)
    target_link_libraries(server ws2_32)
endif()