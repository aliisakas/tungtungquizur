#include "include/httplib.h"
#include "include/json.hpp"
#include "include/cards.hpp" 
#include <iostream>
#include <fstream>

using json = nlohmann::json;

int main() {

    httplib::Server svr; //создаем сервер

    //эндпоинт для получения карточек
    svr.Get("/api/cards", [](const httplib::Request& req, httplib::Response& res) { 
        //"/api/cards" это URL путь к карточкам спроси дипсика

        // Разрешаем запросы с любого источника (*)
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");

        std::ifstream file("../data/cards.json"); 

        if (!file.is_open()) {
            res.set_content(R"({"error": "File not found"})", "application/json"); 
            // про метод тож почитай, если коротко отправляем 1 - данные, 2 - тип 
            return;
        }

        json cards;
        // ловим ошибки чтения карточек
        try {
            cards = json::parse(file);
        } catch (const std::exception& e) {
            res.set_content(R"({"error": "Invalid JSON"})", "application/json");
            return;
        }

        //отправляем карточки клиенту
        // .dump() - преобразование json-объекта (карточек) в строку 
        res.set_content(cards.dump(), "application/json");
    });

    std::cout << "Server started at http://localhost:8080\n";
    // запуск сервера на указанном хосте и порту
    svr.listen("localhost", 8080);

    /* Как это работает вместе?
    1) Пользователь открывает в браузере http://localhost:8080/api/cards.
    2) Сервер (main.cpp) получает GET-запрос.
    3) Читает cards.json → преобразует в JSON-строку → отправляет обратно.
    4) Браузер получает ответ:
    [
    {"id": 1, "word": "apple", "translation": "яблоко"},
    {"id": 2, "word": "run", "translation": "бежать"}
    ]
    */

    return 0;
}