#include <stdio.h>

int main() {
    int a = 5, b = 10;

    if (a = b) {                        // BUG: assignment (=), not comparison (==)
        printf("Equal\n");
    } else {
        printf("Not Equal\n");
    }

    return 0;
}
