#include <stdio.h>

int main() {
    int n = 5;

    for (int i = 1; i < 10; i++) {      // BUG: should be i <= 10
        printf("%d x %d = %d\n", n, i, n * i);
    }

    return 0;
}
