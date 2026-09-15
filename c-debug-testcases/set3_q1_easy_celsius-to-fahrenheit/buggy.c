#include <stdio.h>

int main() {
    float c = 37.0;
    float f = c + 32 * 9.0 / 5.0;       // BUG: operator precedence, should be (c * 9.0 / 5.0) + 32

    printf("Fahrenheit = %.1f\n", f);
    return 0;
}
