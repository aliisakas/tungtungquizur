@echo off
:: Проверяем, установлен ли CMake
where cmake >nul 2>&1
if %errorlevel% neq 0 (
    echo Ошибка: CMake не установлен или не добавлен в PATH.
    echo Скачайте CMake с https://cmake.org/download/
    pause
    exit /b 1
)

:: Создаём папку build (если её нет)
if not exist "build" (
    mkdir build
)

:: Переходим в build и запускаем CMake
cd build
cmake ..
if %errorlevel% neq 0 (
    echo Ошибка при выполнении cmake..
    pause
    exit /b 1
)

:: Собираем проект в Debug 
cmake --build . --config Debug
if %errorlevel% neq 0 (
    echo Ошибка при сборке проекта.
    pause
    exit /b 1
)

:: Проверяем, существует ли server.exe
set EXE_PATH=Debug\server.exe
if not exist "%EXE_PATH%" (
    echo Ошибка: server.exe не найден в build\%EXE_PATH%.
    echo Убедитесь, что:
    echo 1. Имя исполняемого файла правильное.
    echo 2. Проект собрался без ошибок.
    pause
    exit /b 1
)

:: Запускаем server.exe
echo Запускаем server.exe...
start "" "%EXE_PATH%"

pause