#include <stdio.h>

int main() {
    int n = 7;

    if (n % 2 == 0) {
        printf("Odd\n");                // BUG: labels are swapped
    } else {
        printf("Even\n");                // BUG: labels are swapped
    }

    return 0;
}
