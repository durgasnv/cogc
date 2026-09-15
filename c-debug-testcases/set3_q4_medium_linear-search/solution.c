#include <stdio.h>

int search(int arr[], int n, int target) {
    int i;
    for (i = 0; i < n; i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;
}

int main() {
    int arr[] = {4, 8, 15, 16, 23, 42};
    int result = search(arr, 6, 16);
    printf("Result = %d\n", result);
    return 0;
}
