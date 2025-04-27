#include "include/httplib.h"
#include "include/json.hpp"
#include "include/cards.hpp" 
#include <iostream>

int main() {

    httplib::Server svr;

    svr.Get("/api/test", [](const auto& req, auto& res) {
        res.set_content("{\"message\":\"Server is working!\"}", "application/json");
    });

    svr.Get("/api/cards", [](const auto& req, auto& res) {
        auto cards = loadCards();
        res.set_content(cards.dump(), "application/json");
    });

    svr.listen("localhost", 8080);
    
    return 0;
}