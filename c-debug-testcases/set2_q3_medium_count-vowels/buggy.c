#include <stdio.h>
#include <string.h>

int main() {
    char word[] = "programming";
    int count = 0;

    for (int i = 0; i < strlen(word); i++) {
        char ch = word[i];
        if (ch == "a" || ch == "e" || ch == "i" || ch == "o" || ch == "u") {  // BUG: double quotes, not single
            count++;
        }
    }

    printf("Vowels = %d\n", count);
    return 0;
}
