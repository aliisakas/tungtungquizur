#pragma once
#include "json.hpp"
#include <vector>
#include <string>
#include <memory>

namespace nlohmann {
    class CardsManager {
    private:
        std::shared_ptr<json> cards_data;
        static std::shared_ptr<CardsManager> instance;

    protected:
        CardsManager();
        void loadCards();
        void saveCards();

    public:
        static std::shared_ptr<CardsManager> getInstance();
        
        // Основные методы для работы с карточками
        json getAllCards() const;
        std::vector<std::string> getTopics() const;
        json getCardsByTopic(const std::string& topic) const;
        
        // Методы для работы с прогрессом
        bool updateCardProgress(const std::string& topic, int cardId, const json& progress);
        json getCardProgress(const std::string& topic, int cardId) const;
        
        // Дополнительные методы
        bool hasTopic(const std::string& topic) const;
        size_t getTopicSize(const std::string& topic) const;
    };
}