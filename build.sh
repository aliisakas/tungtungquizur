#!/bin/bash

# Проверяем, установлен ли CMake
if ! command -v cmake &> /dev/null; then
    echo "Ошибка: CMake не установлен или не добавлен в PATH."
    echo "Установите CMake через Homebrew: brew install cmake"
    exit 1
fi

# Создаём папку build (если её нет)
if [ ! -d "build" ]; then
    mkdir build
    echo "Создана папка build/"
fi

# Переходим в build и запускаем CMake
cd build || exit
cmake ..
if [ $? -ne 0 ]; then
    echo "Ошибка при выполнении cmake.."
    exit 1
fi

# Собираем проект
cmake --build . --config Debug
if [ $? -ne 0 ]; then
    echo "Ошибка при сборке проекта."
    exit 1
fi

# Проверяем, существует ли исполняемый файл
EXE_PATH="./server"
if [ ! -f "$EXE_PATH" ]; then
    echo "Ошибка: исполняемый файл сервера не найден в $EXE_PATH."
    echo "Убедитесь, что:"
    echo "1. Имя исполняемого файла правильное."
    echo "2. Проект собрался без ошибок."
    exit 1
fi

# Запускаем сервер
echo "Запускаем сервер..."
chmod +x "$EXE_PATH"
"$EXE_PATH" &

# Оставляем терминал открытым
read -p "Нажмите Enter для выхода..."