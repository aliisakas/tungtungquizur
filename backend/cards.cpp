#include <fstream>
#include "include/json.hpp"
#include "include/cards.hpp"

nlohmann::json loadCards() {
    std::ifstream file("data/cards.json");
    return nlohmann::json::parse(file);
}