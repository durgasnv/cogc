#include <stdio.h>

int main() {
    int year = 1900;

    if ((year % 4 == 0 && year % 100 == 0) || year % 400 == 0) {  // BUG: should be year % 100 != 0
        printf("Leap Year\n");
    } else {
        printf("Not a Leap Year\n");
    }

    return 0;
}
