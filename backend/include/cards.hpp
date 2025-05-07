#pragma once
#include "json.hpp"
#include <vector>
#include <string>

namespace nlohmann {
    // Расширяем оригинальный функционал
    json loadCards();
    
    // Новые методы
    std::vector<std::string> getTopics(const json& data);
    json getCardsByTopic(const json& data, const std::string& topic);
}