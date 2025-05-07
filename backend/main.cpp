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
             // Для совместимости: возвращаем все карточки из всех тем
             json all_cards = json::array();
             if (cards.contains("topics")) {
                 for (auto& [_, topic_cards] : cards["topics"].items()) {
                     all_cards.insert(all_cards.end(), topic_cards.begin(), topic_cards.end());
                 }
             } else {
                 all_cards = cards; // Старый формат без тем
             }
             res.set_content(all_cards.dump(), "application/json");
         } catch (const std::exception& e) {
             res.set_content(R"({"error": "Invalid JSON"})", "application/json");
         }
    });

    // 2. Новый эндпоинт для списка тем
    svr.Get("/api/topics", [](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        
        std::ifstream file("../data/cards.json");
        if (!file.is_open()) {
            res.set_content(R"({"error": "File not found"})", "application/json");
            return;
        }

        try {
            json data = json::parse(file);
            if (data.contains("topics")) {
                std::vector<std::string> topics;
                for (auto& [topic, _] : data["topics"].items()) {
                    topics.push_back(topic);
                }
                res.set_content(json(topics).dump(), "application/json");
            } else {
                res.set_content(json::array().dump(), "application/json"); // Нет тем
            }
        } catch (const std::exception& e) {
            res.set_content(R"({"error": "Invalid JSON"})", "application/json");
        }
    });

    // 3. Новый эндпоинт для карточек темы
    svr.Get("/api/cards/:topic", [](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        
        std::string topic = req.path_params.at("topic");
        std::ifstream file("../data/cards.json");
        if (!file.is_open()) {
            res.set_content(R"({"error": "File not found"})", "application/json");
            return;
        }

        try {
            json data = json::parse(file);
            if (data.contains("topics") && data["topics"].contains(topic)) {
                res.set_content(data["topics"][topic].dump(), "application/json");
            } else {
                res.set_content(R"({"error": "Topic not found"})", "application/json");
            }
        } catch (const std::exception& e) {
            res.set_content(R"({"error": "Invalid JSON"})", "application/json");
        }
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