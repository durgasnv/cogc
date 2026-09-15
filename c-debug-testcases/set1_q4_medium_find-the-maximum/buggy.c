#include <stdio.h>

int main() {
    int arr[] = {-3, -7, -2, -9, -4};
    int n = 5;
    int max = 0;                        // BUG: should start at arr[0]

    for (int i = 0; i < n; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
    }

    printf("Max = %d\n", max);
    return 0;
}
