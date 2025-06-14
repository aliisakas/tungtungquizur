#include <fstream>
#include "include/json.hpp"
#include "include/cards.hpp"
#include <stdexcept>

using json = nlohmann::json;

namespace nlohmann {

std::shared_ptr<CardsManager> CardsManager::instance = nullptr;

CardsManager::CardsManager() {
    loadCards();
}

void CardsManager::loadCards() {
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

void CardsManager::saveCards() {
    std::ofstream file("../data/cards.json");
    if (!file.is_open()) {
        throw std::runtime_error("Cannot open file for writing");
    }
    file << cards_data->dump(4);
}

std::shared_ptr<CardsManager> CardsManager::getInstance() {
    if (!instance) {
        instance = std::shared_ptr<CardsManager>(new CardsManager());
    }
    return instance;
}

json CardsManager::getAllCards() const {
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

std::vector<std::string> CardsManager::getTopics() const {
    std::vector<std::string> topics;
    if (cards_data->contains("topics")) {
        for (auto& [topic, _] : (*cards_data)["topics"].items()) {
            topics.push_back(topic);
        }
    }
    return topics;
}

json CardsManager::getCardsByTopic(const std::string& topic) const {
    if (cards_data->contains("topics") && (*cards_data)["topics"].contains(topic)) {
        return (*cards_data)["topics"][topic];
    }
    throw std::runtime_error("Topic not found");
}

bool CardsManager::updateCardProgress(const std::string& topic, int cardId, const json& progress) {
    if (!hasTopic(topic)) {
        return false;
    }

    auto& topic_cards = (*cards_data)["topics"][topic];
    for (auto& card : topic_cards) {
        if (card["id"] == cardId) {
            card["progress"]["interval"] = progress["interval"];
            card["progress"]["nextReview"] = progress["nextReview"];
            saveCards();
            return true;
        }
    }
    return false;
}

json CardsManager::getCardProgress(const std::string& topic, int cardId) const {
    if (!hasTopic(topic)) {
        throw std::runtime_error("Topic not found");
    }

    const auto& topic_cards = (*cards_data)["topics"][topic];
    for (const auto& card : topic_cards) {
        if (card["id"] == cardId) {
            return card["progress"];
        }
    }
    throw std::runtime_error("Card not found");
}

bool CardsManager::hasTopic(const std::string& topic) const {
    return cards_data->contains("topics") && (*cards_data)["topics"].contains(topic);
}

size_t CardsManager::getTopicSize(const std::string& topic) const {
    if (hasTopic(topic)) {
        return (*cards_data)["topics"][topic].size();
    }
    return 0;
}

}