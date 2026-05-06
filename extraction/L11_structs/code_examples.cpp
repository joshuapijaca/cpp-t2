// L11 — Structs canonical examples
// Compileable with #include <iostream> + #include <string> + using namespace std;

// === EX-01: T-01..T-04 — define struct ===
struct Point {
    int x;
    int y;
};
// Three things: keyword `struct`, name, fields in {}, terminating `;`

// === EX-02: T-05..T-08 — instantiate, write, read ===
int main_point() {
    Point p;
    p.x = 3;
    p.y = 4;
    cout << p.x << " " << p.y;   // 3 4
    return 0;
}

// === EX-03: T-09, T-10 — struct contains array ===
struct stat_double {
    double numbers[5];
    double mystery;
};

int main_stat() {
    stat_double d;
    d.numbers[0] = 3.2;
    d.numbers[1] = 7.1;
    d.mystery = d.numbers[0];   // chained access
    return 0;
}

// === EX-04: T-11, T-12 — array of structs ===
int main_list() {
    Point list[3];
    list[0].x = 1; list[0].y = 2;
    list[1].x = 3; list[1].y = 4;
    list[2].x = 5; list[2].y = 6;
    cout << list[1].x;   // 3
    return 0;
}

// === EX-05: SIT102 Q2 archetype ===
struct computer_data {
    int id;
    string description;
    string location;
};
