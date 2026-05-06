// Level 13 — Hand-Execution canonical examples
// Compileable with #include <iostream> + using namespace std;
// Each example exercises specific HE atoms

// ============================================================
// EX-01: HE-10 — chained assignment trace
// ============================================================
int main_he10() {
    int x = 5;
    int y = x;
    cout << y;   // 5
    return 0;
}
// Trace:
//   line 2: x = 5
//   line 3: y = 5  (copy of x's current value)
//   line 4: prints 5

// ============================================================
// EX-02: HE-11 — array element write trace
// ============================================================
int main_he11() {
    int arr[3] = {0, 0, 0};
    arr[1] = 7;
    arr[2] = arr[1] + 1;
    return 0;
}
// Trace final:
//   arr[0] = 0
//   arr[1] = 7
//   arr[2] = 8

// ============================================================
// EX-03: HE-12 — for-loop trace
// ============================================================
int main_he12() {
    int sum = 0;
    for (int i = 1; i <= 4; i++) {
        sum = sum + i;
    }
    cout << sum;   // 10
    return 0;
}
// Trace per iter:
//   i=1, sum: 0 -> 1
//   i=2, sum: 1 -> 3
//   i=3, sum: 3 -> 6
//   i=4, sum: 6 -> 10

// ============================================================
// EX-04: HE-13 — if/else branch trace
// ============================================================
int main_he13() {
    int n = 7;
    int label;
    if (n > 5) {
        label = 1;
    } else {
        label = 2;
    }
    cout << label;   // 1
    return 0;
}

// ============================================================
// EX-05: HE-14 + HE-15 — function call + return; pass-by-value
// ============================================================
void increment_copy(int x) {
    x = x + 1;       // mutates local copy only
}

int main_he15a() {
    int n = 5;
    increment_copy(n);
    cout << n;       // 5 (unchanged)
    return 0;
}

// ============================================================
// EX-06: HE-08 + HE-15 — pass-by-reference (& mutation persists)
// ============================================================
void increment_ref(int &x) {
    x = x + 1;       // mutates caller's box
}

int main_he15b() {
    int n = 5;
    increment_ref(n);
    cout << n;       // 6 (mutated by ref)
    return 0;
}

// ============================================================
// EX-07: HE-16 — max-finder trace (Q1 archetype)
// ============================================================
struct stat_double {
    double numbers[5];
    double mystery;
};

void who_am_i(stat_double &data) {
    data.mystery = data.numbers[0];
    for (int i = 1; i < 5; i++) {
        if (data.numbers[i] > data.mystery) {
            data.mystery = data.numbers[i];
        }
    }
}

int main_he16() {
    stat_double d;
    d.numbers[0] = 3.2;
    d.numbers[1] = 7.1;
    d.numbers[2] = 5.0;
    d.numbers[3] = 9.4;
    d.numbers[4] = 2.8;
    who_am_i(d);
    cout << d.mystery;   // 9.4
    return 0;
}
// Trace final:
//   d.numbers = [3.2, 7.1, 5.0, 9.4, 2.8]
//   d.mystery = 9.4 (max found)

// ============================================================
// EX-08: HE-09 — arr[i] write persists with &
// ============================================================
void fill_first(int &arr_elem) {
    arr_elem = 99;
}

int main_he09() {
    int arr[3] = {1, 2, 3};
    fill_first(arr[0]);
    cout << arr[0];   // 99
    return 0;
}

// ============================================================
// EX-09: HE-17 + HE-18 — struct field mutation through &; chained access
// ============================================================
struct stat_double_alt {
    double numbers[3];
    double mystery;
};

void seed_mystery(stat_double_alt &d) {
    d.mystery = d.numbers[0];   // HE-18 chained access
}

int main_he17() {
    stat_double_alt s;
    s.numbers[0] = 4.4;
    s.numbers[1] = 9.9;
    s.numbers[2] = 2.2;
    s.mystery = 0.0;
    seed_mystery(s);
    cout << s.mystery;   // 4.4 (mutation through & persists)
    return 0;
}
