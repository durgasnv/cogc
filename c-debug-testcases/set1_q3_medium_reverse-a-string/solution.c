#include <stdio.h>
#include <string.h>

int main() {
    char s[] = "hello";
    int len = strlen(s);

    for (int i = 0; i < len / 2; i++) {
        char temp = s[i];
        s[i] = s[len - 1 - i];
        s[len - 1 - i] = temp;
    }

    printf("Reversed = %s\n", s);
    return 0;
}
