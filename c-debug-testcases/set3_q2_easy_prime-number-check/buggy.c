#include <stdio.h>

int main() {
    int n = 7;
    int isPrime = 1;

    for (int i = 1; i < n; i++) {       // BUG: should start at i = 2
        if (n % i == 0) {
            isPrime = 0;
        }
    }

    printf("%d is %s\n", n, isPrime ? "Prime" : "Not Prime");
    return 0;
}
