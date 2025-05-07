#include <fstream>
#include "include/json.hpp"
#include "include/cards.hpp"

using json = nlohmann::json;

// Оригинальная функция (без изменений)
json nlohmann::loadCards() {
    std::ifstream file("data/cards.json");
    return json::parse(file);
}

// Новый метод: получение списка тем
std::vector<std::string> nlohmann::getTopics(const json& data) {
    std::vector<std::string> topics;
    if (data.contains("topics")) {
        for (auto& [topic, _] : data["topics"].items()) {
            topics.push_back(topic);
        }
    }
    return topics;
}

// Новый метод: получение карточек по теме
json nlohmann::getCardsByTopic(const json& data, const std::string& topic) {
    if (data.contains("topics") && data["topics"].contains(topic)) {
        return data["topics"][topic];
    }
    return json::array(); // Возвращаем пустой массив, если тема не найдена
}