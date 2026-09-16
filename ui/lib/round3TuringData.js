export const MASTER_TURING_QUESTIONS = [
  {
    id: 1,
    title: "You're late to class",
    prompt: "You woke up late and missed the first 15 minutes of class. What do you do?",
    solutionA: "Quietly slip in through the back door and sit down without drama. Ask a classmate for missed notes after lecture.",
    solutionB: "Enter quietly without disruption, briefly apologize to the professor for oversleeping, and borrow notes later.",
    answerA: "Human",
    answerB: "AI"
  },
  {
    id: 2,
    title: "Print multiplication table in Python",
    prompt: "Print the multiplication table of a given number (like 7).",
    solutionA: "n = 7\nfor i in range(1, 11):\n    print(f\"{n} x {i} = {n*i}\")",
    solutionB: "num = int(input(\"Enter number: \"))\nfor i in range(1, 11):\n    print(num, \"x\", i, \"=\", num * i)",
    answerA: "AI",
    answerB: "Human"
  },
  {
    id: 3,
    title: "Explain WiFi in simple terms",
    prompt: "Your non-tech friend asks \"What is WiFi exactly?\"",
    solutionA: "Invisible cables: your router broadcasts internet via radio waves that your laptop receives wirelessly within range.",
    solutionB: "WiFi is wireless internet sent over radio waves. Walk too far from the router and you lose signal.",
    answerA: "AI",
    answerB: "Human"
  },
  {
    id: 4,
    title: "Output of this C code?",
    prompt: "What is the output of printf(\"%d %d %d\", a, a++, ++a) where a = 5?",
    solutionA: "Undefined behavior in C. Function argument evaluation order is compiler-dependent and not guaranteed by standard.",
    solutionB: "Undefined behavior. Compilers evaluate printf arguments in arbitrary order. Never modify a variable twice in one call.",
    answerA: "Human",
    answerB: "AI"
  },
  {
    id: 5,
    title: "Exam study strategy",
    prompt: "Describe your study strategy for semester exams.",
    solutionA: "I start 2 weeks early, review slides, solve past question papers, and make a 1-page formula cheatsheet.",
    solutionB: "Past papers are the GOAT. I solve previous year papers and watch 2x YouTube crash courses the night before.",
    answerA: "AI",
    answerB: "Human"
  },
  {
    id: 6,
    title: "What happens when you type google.com?",
    prompt: "Explain what happens step by step when you navigate to google.com.",
    solutionA: "1. DNS resolves domain to IP\n2. TCP + TLS handshake\n3. HTTP GET request sent\n4. Server returns HTML/CSS/JS\n5. Browser renders DOM",
    solutionB: "Browser queries DNS for IP, establishes TCP/TLS connection with Google servers, requests web assets, and renders the page in ~1s.",
    answerA: "Human",
    answerB: "AI"
  },
  {
    id: 7,
    title: "Late night bug before submission",
    prompt: "You discover a bug at 11 PM and submission is at 9 AM tomorrow. Approach?",
    solutionA: "Don't pull an all-nighter. Attempt a 1-hour fix; if tricky, document the known bug and submit working backup code.",
    solutionB: "Assess severity, attempt a quick reproduction and patch before a strict 1 AM cutoff, or document the issue cleanly.",
    answerA: "Human",
    answerB: "AI"
  },
  {
    id: 8,
    title: "File vs Folder difference",
    prompt: "Explain to a 10-year-old the difference between a file and a folder.",
    solutionA: "A file is a single sheet of paper (photo/doc); a folder is the binder box that keeps multiple files organized.",
    solutionB: "A file is one item (photo/song), and a folder is the shelf holding them. Extensions like .jpg identify file types.",
    answerA: "AI",
    answerB: "Human"
  },
  {
    id: 9,
    title: "Palindrome checker in Python",
    prompt: "Check if a given string reads the same forwards and backwards.",
    solutionA: "def is_palindrome(s):\n    s = s.lower().replace(\" \", \"\")\n    return s == s[::-1]",
    solutionB: "def is_palindrome(s):\n    s = s.lower().replace(\" \", \"\")\n    left, right = 0, len(s) - 1\n    while left < right:\n        if s[left] != s[right]: return False\n        left += 1; right -= 1\n    return True",
    answerA: "AI",
    answerB: "Human"
  },
  {
    id: 10,
    title: "Why engineering?",
    prompt: "Why did you choose engineering as your career?",
    solutionA: "Curiosity about building apps and hardware plus solid tech placement opportunities and versatile foundations.",
    solutionB: "I enjoy problem-solving and software systems. Engineering provides rigorous analytical training and strong career growth.",
    answerA: "Human",
    answerB: "AI"
  },
  {
    id: 11,
    title: "Output of Python list assignment",
    prompt: "What happens when you do `a = [1, 2, 3]; b = a; b.append(4); print(a)`?",
    solutionA: "`[1, 2, 3, 4]`. In Python `b = a` assigns by reference, so mutating `b` modifies the same list object in memory.",
    solutionB: "Output is `[1, 2, 3, 4]`. Lists are mutable references in Python. Use `b = a.copy()` for an independent clone.",
    answerA: "Human",
    answerB: "AI"
  },
  {
    id: 12,
    title: "Free-rider in group project",
    prompt: "One group member isn't contributing any work. What do you do?",
    solutionA: "Talk to them directly first. If they still slack off, split their tasks among active members and notify the professor.",
    solutionB: "Reach out privately to check for blockers. If non-responsive, redistribute tasks and update instructor on contribution split.",
    answerA: "Human",
    answerB: "AI"
  },
  {
    id: 13,
    title: "RAM vs Storage difference",
    prompt: "Explain the difference between RAM and SSD/HDD storage.",
    solutionA: "RAM is fast temporary memory cleared on power off; SSD/HDD is permanent storage where files remain saved.",
    solutionB: "RAM = working desk (fast, temporary workspace); Storage = cupboard (where your files actually live long-term).",
    answerA: "AI",
    answerB: "Human"
  },
  {
    id: 14,
    title: "Check positive, negative, or zero in C",
    prompt: "Take an integer input and print whether it's positive, negative, or zero.",
    solutionA: "#include <stdio.h>\nint main() {\n    int n;\n    scanf(\"%d\", &n);\n    if (n > 0) printf(\"Positive\");\n    else if (n < 0) printf(\"Negative\");\n    else printf(\"Zero\");\n}",
    solutionB: "#include <stdio.h>\nint main() {\n    int num;\n    scanf(\"%d\", &num);\n    if (num > 0) printf(\"%d is positive\\n\", num);\n    else if (num < 0) printf(\"%d is negative\\n\", num);\n    else printf(\"Number is zero\\n\");\n}",
    answerA: "Human",
    answerB: "AI"
  },
  {
    id: 15,
    title: "Why is Python beginner friendly?",
    prompt: "Why is Python recommended for beginners?",
    solutionA: "Clean English-like syntax without semicolons or boilerplate, plus an enormous ecosystem of helpful packages.",
    solutionB: "Simple syntax with no braces or types — `print('Hello')` is just 1 line instead of 6 lines of C boilerplate.",
    answerA: "AI",
    answerB: "Human"
  },
  {
    id: 16,
    title: "Stuck on a coding bug for > 1 hour",
    prompt: "You've been stuck on a coding problem for an hour. Next step?",
    solutionA: "Step away for 10 minutes for fresh eyes, re-read problem constraints, or search specific error messages online.",
    solutionB: "Walk away for 10 mins. Then try rubber duck debugging or search Stack Overflow before looking at solution hints.",
    answerA: "AI",
    answerB: "Human"
  },
  {
    id: 17,
    title: "Compiler vs Interpreter",
    prompt: "Explain compiler vs interpreter in simple terms.",
    solutionA: "Compiler: translates entire code to machine binary at once (faster). Interpreter: runs line-by-line (easier debugging).",
    solutionB: "Compilers convert the full source into machine binary before runtime; interpreters execute instructions line by line.",
    answerA: "Human",
    answerB: "AI"
  },
  {
    id: 18,
    title: "College vs personal life time balance",
    prompt: "How do you balance college studies, assignments, and personal life?",
    solutionA: "Attend lectures to reduce study overhead, start assignments 2 days before deadline, and reserve weekends for fun.",
    solutionB: "Set small daily assignment goals, prioritize urgent deadlines, and schedule hobby time to prevent burnout.",
    answerA: "Human",
    answerB: "AI"
  },
  {
    id: 19,
    title: "HTTP vs HTTPS difference",
    prompt: "What is the difference between HTTP and HTTPS?",
    solutionA: "HTTPS adds SSL/TLS encryption to HTTP, safeguarding passwords and data from man-in-the-middle network snooping.",
    solutionB: "HTTP is unencrypted plain text. HTTPS is encrypted with SSL (the padlock icon) so hackers on public WiFi can't read data.",
    answerA: "AI",
    answerB: "Human"
  },
  {
    id: 20,
    title: "Find largest of 3 numbers in Python",
    prompt: "Take three numbers and print the largest.",
    solutionA: "a, b, c = 10, 25, 15\nprint(\"Largest is\", max(a, b, c))",
    solutionB: "a, b, c = 10, 25, 15\nif a >= b and a >= c: largest = a\nelif b >= a and b >= c: largest = b\nelse: largest = c\nprint(\"Largest is\", largest)",
    answerA: "Human",
    answerB: "AI"
  },
  {
    id: 21,
    title: "Reverse a string in C",
    prompt: "Write a function to reverse a null-terminated string in-place in C.",
    solutionA: "void rev(char *s) {\n    int i = 0, j = strlen(s) - 1;\n    while(i < j) { char t = s[i]; s[i++] = s[j]; s[j--] = t; }\n}",
    solutionB: "void reverseString(char* str) {\n    if (!str) return;\n    int len = strlen(str);\n    for (int i = 0; i < len / 2; i++) {\n        char temp = str[i];\n        str[i] = str[len - i - 1];\n        str[len - i - 1] = temp;\n    }\n}",
    answerA: "Human",
    answerB: "AI"
  },
  {
    id: 22,
    title: "Git Merge vs Git Rebase",
    prompt: "When should a developer use git merge vs git rebase?",
    solutionA: "Rebase keeps a clean, linear commit history for feature branches; merge preserves the true chronological history with merge commits.",
    solutionB: "Merge when you want to keep the exact branch history with a merge commit; rebase when you want a straight linear commit log.",
    answerA: "AI",
    answerB: "Human"
  },
  {
    id: 23,
    title: "Check even or odd using bitwise in C",
    prompt: "Check whether an integer n is even or odd without using the modulo (%) operator.",
    solutionA: "if ((n & 1) == 0) printf(\"Even\"); else printf(\"Odd\");",
    solutionB: "printf((n & 1) ? \"Odd\" : \"Even\");",
    answerA: "Human",
    answerB: "AI"
  },
  {
    id: 24,
    title: "Explain SQL Primary Key vs Foreign Key",
    prompt: "What is the relationship between a Primary Key and a Foreign Key in relational databases?",
    solutionA: "A Primary Key uniquely identifies a row in a table. A Foreign Key references the Primary Key of another table to establish relationships.",
    solutionB: "Primary Key = unique ID for this table's rows (e.g. StudentID). Foreign Key = points to another table's Primary Key to link data.",
    answerA: "AI",
    answerB: "Human"
  },
  {
    id: 25,
    title: "Swap two variables without third variable in Python",
    prompt: "Swap variable a and b in Python without using a temporary variable.",
    solutionA: "a, b = b, a",
    solutionB: "a = a ^ b\nb = a ^ b\na = a ^ b",
    answerA: "Human",
    answerB: "AI"
  },
  {
    id: 26,
    title: "Explain Recursion to a 5-year-old",
    prompt: "How do you explain recursion to a child?",
    solutionA: "Standing between two mirrors where you see smaller versions of yourself forever until someone turns off the light.",
    solutionB: "Russian nesting dolls: opening a doll reveals a smaller identical doll inside until you reach the solid baby doll (base case).",
    answerA: "Human",
    answerB: "AI"
  },
  {
    id: 27,
    title: "Binary Search time complexity",
    prompt: "Why is Binary Search O(log n) instead of O(n)?",
    solutionA: "Because every comparison cuts the search interval in half (N -> N/2 -> N/4 ... -> 1), taking log2(N) steps.",
    solutionB: "With each step, Binary Search halves the remaining elements, resulting in a logarithmic time complexity of O(log n).",
    answerA: "Human",
    answerB: "AI"
  },
  {
    id: 28,
    title: "Find factorial in Python",
    prompt: "Calculate the factorial of a positive integer n.",
    solutionA: "import math\nprint(math.factorial(n))",
    solutionB: "def fact(n):\n    return 1 if n <= 1 else n * fact(n - 1)",
    answerA: "Human",
    answerB: "AI"
  },
  {
    id: 29,
    title: "What is Docker?",
    prompt: "How would you explain Docker containers in 1 sentence?",
    solutionA: "Docker packages an app with all its libraries and dependencies so it runs identically on any computer or cloud server.",
    solutionB: "Docker solves 'it works on my machine' by putting your code and environment in a lightweight portable container.",
    answerA: "AI",
    answerB: "Human"
  },
  {
    id: 30,
    title: "Check prime number in C",
    prompt: "Check if an integer n is prime.",
    solutionA: "#include <stdio.h>\nint isPrime(int n) {\n    if (n < 2) return 0;\n    for(int i=2; i*i<=n; i++) if (n % i == 0) return 0;\n    return 1;\n}",
    solutionB: "int isPrime(int n) {\n    if (n <= 1) return 0;\n    for (int i = 2; i <= n / 2; i++) {\n        if (n % i == 0) return 0;\n    }\n    return 1;\n}",
    answerA: "Human",
    answerB: "AI"
  },
  {
    id: 31,
    title: "Stack vs Queue difference",
    prompt: "Contrast a Stack data structure with a Queue data structure.",
    solutionA: "Stack is LIFO (Last In First Out like a stack of plates); Queue is FIFO (First In First Out like a cafeteria line).",
    solutionB: "Stacks follow Last-In-First-Out (push/pop at top); Queues follow First-In-First-Out (enqueue at rear, dequeue at front).",
    answerA: "Human",
    answerB: "AI"
  },
  {
    id: 32,
    title: "Counting word frequencies in Python",
    prompt: "Count the frequency of each word in a given sentence string.",
    solutionA: "from collections import Counter\ncounts = Counter(text.lower().split())",
    solutionB: "d = {}\nfor w in text.lower().split():\n    d[w] = d.get(w, 0) + 1",
    answerA: "AI",
    answerB: "Human"
  },
  {
    id: 33,
    title: "What is an API?",
    prompt: "Explain what an API is using a restaurant analogy.",
    solutionA: "The waiter is the API: you (client) place an order from menu, waiter takes it to the kitchen (server), and brings your food back.",
    solutionB: "An API acts as a waiter that delivers your request to the database kitchen and returns the processed response to your table.",
    answerA: "Human",
    answerB: "AI"
  },
  {
    id: 34,
    title: "Find second largest in an array in C",
    prompt: "Find the second largest number in an integer array of size n.",
    solutionA: "int max1 = -1e9, max2 = -1e9;\nfor(int i=0; i<n; i++) {\n    if (arr[i] > max1) { max2 = max1; max1 = arr[i]; }\n    else if (arr[i] > max2 && arr[i] != max1) max2 = arr[i];\n}",
    solutionB: "// Sort the array ascending\nqsort(arr, n, sizeof(int), cmp);\nint second = arr[n - 2];",
    answerA: "Human",
    answerB: "AI"
  },
  {
    id: 35,
    title: "Why use Git?",
    prompt: "Why do programmers need version control (Git)?",
    solutionA: "To track code changes, revert mistakes, collaborate without overwriting teammates' files, and branch features safely.",
    solutionB: "Because saving files as `project_final_v2_FINAL_really.zip` is pure chaos. Git lets you travel back in time.",
    answerA: "AI",
    answerB: "Human"
  }
];

export const ROUND3_TIME_LIMIT_SECONDS = 900; // 15 minutes (900s)
export const ROUND3_PASS_PERCENTAGE = 60; // 60% passing cutoff (12/20)

/**
 * Samples count random questions from the master question bank,
 * and randomly flips Solution A and Solution B so teams never have identical layouts.
 */
export function sampleRandomRound3Questions(count = 20) {
  const pool = MASTER_TURING_QUESTIONS.slice();
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const selected = pool.slice(0, Math.min(count, pool.length));

  return selected.map((q) => {
    const flip = Math.random() > 0.5;
    return {
      ...q,
      displayA: flip ? q.solutionB : q.solutionA,
      displayB: flip ? q.solutionA : q.solutionB,
      answerForA: flip ? q.answerB : q.answerA,
      answerForB: flip ? q.answerA : q.answerB,
    };
  });
}
