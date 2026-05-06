// L10 — Arrays canonical examples
// Compileable with #include <iostream> + using namespace std;

// EX-01: declare + index
int main_g01() {
    int arr[5];
    arr[0] = 10;
    arr[1] = 20;
    arr[2] = 30;
    return 0;
}

// EX-02: init
int main_g03() {
    int v[5] = {1, 2, 3, 4, 5};
    cout << v[0] << v[4];   // 15
    return 0;
}

// EX-03: for-loop iterate
int main_g11() {
    int v[5] = {1, 2, 3, 4, 5};
    int sum = 0;
    for (int i = 0; i < 5; i++) {
        sum = sum + v[i];
    }
    cout << sum;   // 15
    return 0;
}

// EX-04: array param via & (Q3 idiom)
struct Item { int id; };
void fill(Item &list[], int count) {
    for (int i = 0; i < count; i++) {
        list[i].id = i;
    }
}

int main_g14() {
    Item arr[3];
    fill(arr, 3);
    return 0;
}
