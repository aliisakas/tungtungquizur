#include "include/httplib.h"
#include "include/json.hpp"
#include "include/cards.hpp" 
#include <iostream>
#include <fstream>
#include <memory>
#include <string>
#include <vector>

using json = nlohmann::json;

class CardsManager {
private:
    std::shared_ptr<json> cards_data;
    static std::shared_ptr<CardsManager> instance;

protected:
    CardsManager() {
        loadCards();
    }

    void loadCards() {
        std::ifstream file("../data/cards.json");
        if (!file.is_open()) {
            throw std::runtime_error("File not found");
        }
        try {
            cards_data = std::make_shared<json>(json::parse(file));
        } catch (const std::exception& e) {
            throw std::runtime_error("Invalid JSON");
        }
    }

public:
    static std::shared_ptr<CardsManager> getInstance() {
        if (!instance) {
            instance = std::shared_ptr<CardsManager>(new CardsManager());
        }
        return instance;
    }

    json getAllCards() const {
        json all_cards = json::array();
        if (cards_data->contains("topics")) {
            for (auto& [_, topic_cards] : (*cards_data)["topics"].items()) {
                all_cards.insert(all_cards.end(), topic_cards.begin(), topic_cards.end());
            }
        } else {
            all_cards = *cards_data;
        }
        return all_cards;
    }

    std::vector<std::string> getTopics() const {
        std::vector<std::string> topics;
        if (cards_data->contains("topics")) {
            for (auto& [topic, _] : (*cards_data)["topics"].items()) {
                topics.push_back(topic);
            }
        }
        return topics;
    }

    json getTopicCards(const std::string& topic) const {
        if (cards_data->contains("topics") && (*cards_data)["topics"].contains(topic)) {
            return (*cards_data)["topics"][topic];
        }
        throw std::runtime_error("Topic not found");
    }
};

std::shared_ptr<CardsManager> CardsManager::instance = nullptr;

int main() {
    httplib::Server svr;

    // 1. Эндпоинт для получения всех карточек
    svr.Get("/api/cards", [](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");

        try {
            auto cards_manager = CardsManager::getInstance();
            json all_cards = cards_manager->getAllCards();
            res.set_content(all_cards.dump(), "application/json");
        } catch (const std::exception& e) {
            res.set_content(R"({"error": ")" + std::string(e.what()) + R"("})", "application/json");
        }
    });

    // 2.Эндпоинт для списка тем
    svr.Get("/api/topics", [](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        
        try {
            auto cards_manager = CardsManager::getInstance();
            auto topics = cards_manager->getTopics();
            res.set_content(json(topics).dump(), "application/json");
        } catch (const std::exception& e) {
            res.set_content(R"({"error": ")" + std::string(e.what()) + R"("})", "application/json");
        }
    });

    // Эндпоинт для карточек темы
    svr.Get("/api/cards/:topic", [](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        
        std::string topic = req.path_params.at("topic");
        try {
            auto cards_manager = CardsManager::getInstance();
            json topic_cards = cards_manager->getTopicCards(topic);
            res.set_content(topic_cards.dump(), "application/json");
        } catch (const std::exception& e) {
            res.set_content(R"({"error": ")" + std::string(e.what()) + R"("})", "application/json");
        }
    });

    std::cout << "Server started at http://localhost:8080\n";
    svr.listen("localhost", 8080);

    return 0;
}