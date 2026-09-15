#include <stdio.h>

int main() {
    int mat[2][4] = {{1, 2, 3, 4}, {5, 6, 7, 8}};
    int rows = 2, cols = 4;
    int sum = 0;

    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            sum += mat[i][j];
        }
    }

    printf("Sum = %d\n", sum);
    return 0;
}
