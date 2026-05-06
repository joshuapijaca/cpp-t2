// L14 — Struct-Write canonical examples (Q2)
// Compileable with #include <string> + using namespace std;

// === EX-01: Q2 archetype — computer_data ===
struct computer_data {
    int id;
    string description;
    string location;
};

// === EX-02: variant — student_data ===
struct student_data {
    int id;
    string name;
    string course;
};

// === EX-03: variant — vehicle_data ===
struct vehicle_data {
    int year;
    string make;
    string model;
};

// === Common errors (DO NOT WRITE) ===
//
// 1. typedef struct (C-style):
//    typedef struct { int id; } computer_data;     // wrong; use C++ struct
//
// 2. Missing trailing semicolon:
//    struct X { int id; }                          // missing ; — compile error
//
// 3. Comma between fields:
//    struct X { int id, string name; };            // wrong; use ; per field
//
// 4. std::string (when using namespace std):
//    struct X { int id; std::string name; };       // unnecessary; use string
