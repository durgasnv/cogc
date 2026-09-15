#include <stdio.h>

int main() {
    int n = 7;
    int isPrime = 1;

    for (int i = 2; i < n; i++) {
        if (n % i == 0) {
            isPrime = 0;
        }
    }

    printf("%d is %s\n", n, isPrime ? "Prime" : "Not Prime");
    return 0;
}
