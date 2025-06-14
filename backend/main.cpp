#include "include/httplib.h"
#include "include/json.hpp"
#include "include/cards.hpp" 
#include <iostream>
#include <fstream>
#include <memory>
#include <string>
#include <vector>

using json = nlohmann::json;

// Функция для установки CORS заголовков
void setCorsHeaders(httplib::Response& res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    res.set_header("Access-Control-Allow-Headers", "Content-Type");
}

int main() {
    httplib::Server svr;

    // Обработка OPTIONS запросов
    svr.Options(".*", [](const httplib::Request& req, httplib::Response& res) {
        setCorsHeaders(res);
    });

    // 1. Эндпоинт для получения всех карточек
    svr.Get("/api/cards", [](const httplib::Request& req, httplib::Response& res) {
        setCorsHeaders(res);
        try {
            auto cards_manager = nlohmann::CardsManager::getInstance();
            json all_cards = cards_manager->getAllCards();
            res.set_content(all_cards.dump(), "application/json");
        } catch (const std::exception& e) {
            res.set_content(R"({"error": ")" + std::string(e.what()) + R"("})", "application/json");
        }
    });

    // 2. Эндпоинт для списка тем
    svr.Get("/api/topics", [](const httplib::Request& req, httplib::Response& res) {
        setCorsHeaders(res);
        try {
            auto cards_manager = nlohmann::CardsManager::getInstance();
            auto topics = cards_manager->getTopics();
            res.set_content(json(topics).dump(), "application/json");
        } catch (const std::exception& e) {
            res.set_content(R"({"error": ")" + std::string(e.what()) + R"("})", "application/json");
        }
    });

    // 3. Эндпоинт для карточек темы
    svr.Get("/api/cards/:topic", [](const httplib::Request& req, httplib::Response& res) {
        setCorsHeaders(res);
        std::string topic = req.path_params.at("topic");
        try {
            auto cards_manager = nlohmann::CardsManager::getInstance();
            if (cards_manager->hasTopic(topic)) {
                json topic_cards = cards_manager->getCardsByTopic(topic);
                res.set_content(topic_cards.dump(), "application/json");
            } else {
                res.set_content(R"({"error": "Topic not found"})", "application/json");
            }
        } catch (const std::exception& e) {
            res.set_content(R"({"error": ")" + std::string(e.what()) + R"("})", "application/json");
        }
    });

    // 4. Эндпоинт для обновления прогресса карточки
    svr.Put("/api/cards/:topic/:id", [](const httplib::Request& req, httplib::Response& res) {
        setCorsHeaders(res);
        std::string topic = req.path_params.at("topic");
        int cardId = std::stoi(req.path_params.at("id"));

        try {
            auto cards_manager = nlohmann::CardsManager::getInstance();
            json card_data = json::parse(req.body);
            
            if (cards_manager->updateCardProgress(topic, cardId, card_data["progress"])) {
                res.set_content(R"({"success": true})", "application/json");
            } else {
                res.set_content(R"({"error": "Failed to update card progress"})", "application/json");
            }
        } catch (const std::exception& e) {
            res.set_content(R"({"error": ")" + std::string(e.what()) + R"("})", "application/json");
        }
    });

    // 5. Эндпоинт для получения прогресса карточки
    svr.Get("/api/cards/:topic/:id/progress", [](const httplib::Request& req, httplib::Response& res) {
        setCorsHeaders(res);
        std::string topic = req.path_params.at("topic");
        int cardId = std::stoi(req.path_params.at("id"));

        try {
            auto cards_manager = nlohmann::CardsManager::getInstance();
            json progress = cards_manager->getCardProgress(topic, cardId);
            res.set_content(progress.dump(), "application/json");
        } catch (const std::exception& e) {
            res.set_content(R"({"error": ")" + std::string(e.what()) + R"("})", "application/json");
        }
    });

    std::cout << "Server started at http://localhost:8080\n";
    svr.listen("localhost", 8080);

    return 0;
}