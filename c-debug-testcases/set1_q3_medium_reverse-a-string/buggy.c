#include <stdio.h>
#include <string.h>

int main() {
    char s[] = "hello";
    int len = strlen(s);

    for (int i = 0; i < len; i++) {     // BUG: should be i < len / 2
        char temp = s[i];
        s[i] = s[len - 1 - i];
        s[len - 1 - i] = temp;
    }

    printf("Reversed = %s\n", s);
    return 0;
}
