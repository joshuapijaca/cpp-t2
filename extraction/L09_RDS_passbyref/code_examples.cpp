// Level 9 — Pass-by-Reference (RDS) — Canonical Code Examples
// All compileable assuming: #include <iostream> + using namespace std;
// Verbatim or near-verbatim from PFG Part 2 Chapter 4

// ============================================================
// EX-01: update / draw player (struct + & + const &)
// ============================================================
// SOURCE: part-2-organised-code/4-indirect-access/0-panorama/1-reference-params.md (lines 22-48)
// Atoms: R-04 (void f(T &x) binds caller), R-05 (mutation affects caller), R-07 (const &)

void update_player(player_data &player) {
    if (key_down(LEFT_KEY)) {
        player.x -= PLAYER_SPEED;
    }
    if (key_down(RIGHT_KEY)) {
        player.x += PLAYER_SPEED;
    }
}

void draw_player(const player_data &player) {
    fill_circle(color_blue(), player.x, player.y, PLAYER_RADIUS);
}
// Expected: player1.x changes after update_player(player1) call
// draw_player cannot modify player (const &)

// ============================================================
// EX-02: update_user procedure (struct mutation via reference)
// ============================================================
// SOURCE: part-2-organised-code/4-indirect-access/1-tour/00-explore-references.mdx (lines 224-253)
// Atoms: R-04, R-05, R-08 (reference = same memory, two names)

void update_user(user_data& user) {
    bool updating = true;
    while (updating) {
        print_user(user);
        write_line("What would you like to update?");
        int choice = read_integer("Enter your choice: ", 0, 2);
        switch (choice) {
            case 0:
                updating = false;
                break;
            case 1:
                user.username = read_string("Enter new username: ");
                break;
            case 2:
                user.role = read_role();
                break;
        }
    }
}
// Expected: caller's user struct sees all field mutations

// ============================================================
// EX-03: double_it — core pass-by-ref demo (CANONICAL FOR R-01..R-06)
// ============================================================
// SOURCE: part-2-organised-code/4-indirect-access/2-trailside/01-pass-by-ref.mdx (lines 222-227)
// Atoms: R-01 (default copy), R-02 (no mutation w/o &), R-04, R-05, R-06 (must pass variable)

void double_it(int &data) {
    write_line("Data passed in was " + to_string(data) + ", about to double it...");
    data = data * 2;
    write_line("In double_it data is now " + to_string(data));
}

int main() {
    int val = 3;
    int other = 1;
    write_line("In main val is " + to_string(val));
    double_it(val);
    write_line("Back in main val is now " + to_string(val));
    double_it(other);
    return 0;
}
/* Expected output:
   In main val is 3
   Data passed in was 3, about to double it...
   In double_it data is now 6
   Back in main val is now 6
   Data passed in was 1, about to double it...
   In double_it data is now 2
*/

// ============================================================
// EX-04: print_user (const & for read-only)
// ============================================================
// SOURCE: part-2-organised-code/4-indirect-access/1-tour/00-explore-references.mdx (lines 167-172)
// Atoms: R-03 (& creates alias), R-07 (const & prevents mutation), R-08 (same memory, two names)

void print_user(const user_data& user) {
    write_line("User details:");
    write_line("  Username: " + user.username);
    write_line("  Role: " + to_string(user.role));
}
// Read-only: cannot do user.username = ... here

// ============================================================
// EX-05: pass-by-value contrast (R-02 demonstration)
// ============================================================
// SYNTHESIZED from PFG semantics for explicit value-vs-ref contrast
// Atoms: R-01, R-02 (mutating copy doesn't change caller)

void increment_copy(int x) {
    x = x + 1;          // mutates only local copy
}

int main_contrast() {
    int n = 5;
    increment_copy(n);
    cout << n << endl;  // prints 5 (unchanged)
    return 0;
}

// ============================================================
// EX-06: minimal &-reference (clean for memorize-card use)
// ============================================================
// MINIMAL FORM derived from EX-03 (double_it)
// Atoms: R-03, R-04, R-05

void increment(int &x) {
    x = x + 1;
}

int main_minimal() {
    int n = 5;
    increment(n);
    cout << n << endl;  // prints 6
    return 0;
}
