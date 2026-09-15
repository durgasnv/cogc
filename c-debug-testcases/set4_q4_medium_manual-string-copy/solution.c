#include <stdio.h>

void myStrCopy(char *dest, char *src) {
    int i;
    for (i = 0; src[i] != '\0'; i++) {
        dest[i] = src[i];
    }
    dest[i] = '\0';
}

int main() {
    char dest[20] = "XXXXXXXXXXXXXXXXXXX";
    myStrCopy(dest, "hello");
    printf("Copied = %s\n", dest);
    return 0;
}
