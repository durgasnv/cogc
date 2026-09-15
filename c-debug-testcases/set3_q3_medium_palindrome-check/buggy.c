#include <stdio.h>
#include <string.h>

int main() {
    char s[] = "madam";
    int len = strlen(s);
    int isPalindrome = 1;

    for (int i = 0; i < len; i++) {
        if (s[i] != s[len - i]) {       // BUG: should be len - 1 - i
            isPalindrome = 0;
        }
    }

    printf("%s is %s\n", s, isPalindrome ? "a Palindrome" : "not a Palindrome");
    return 0;
}
