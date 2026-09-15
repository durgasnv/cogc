#include <stdio.h>

int main() {
    int arr[] = {10, 20, 30, 40, 50};
    int n = 5;
    int sum = 0;

    for (int i = 0; i < n - 1; i++) {   // BUG: should be i < n
        sum += arr[i];
    }

    printf("Sum = %d\n", sum);
    return 0;
}
