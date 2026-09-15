1. You're late to class. What do you do?
Problem: You woke up late and missed the first 15 minutes of class. What do you do?
Solution A:
I'd quietly slip in through the back door, find a seat, and not draw attention to myself. If the professor notices, I'd just smile and sit down. I'd ask a classmate what I missed after class. No point making a big deal out of it.
Solution B:
First, I'd try to enter quietly without disrupting the class. If the professor asks, I'd briefly apologize and explain honestly that I overslept. Then I'd get the notes from a friend and try to catch up. It happens — being honest is better than making up excuses.
2. Write a Python program to print multiplication table of a number
Problem: Print the multiplication table of a given number (like 7).
Solution A:
n = 7
for i in range(1, 11):
    print(f"{n} x {i} = {n*i}")
Solution B:
num = int(input("Enter a number: "))
i = 1
while i <= 10:
    print(num, "x", i, "=", num * i)
    i += 1
3. Your friend asks you to explain what WiFi is. What do you say?
Problem: Your non-tech friend asks "What is WiFi exactly?" Explain in simple terms.
Solution A:
WiFi is basically invisible cables. Your router sends internet data through radio waves (like FM radio but for internet), and your phone/laptop catches those waves. That's why you don't need wires. It has a limited range — go too far from the router and you lose signal. The name "WiFi" doesn't actually stand for anything specific, despite people saying "Wireless Fidelity."
Solution B:
WiFi is a wireless way to connect to the internet. Your router takes the internet from the cable/fiber line and broadcasts it as radio signals. Your phone picks up those signals and that's how you get internet without wires. Its short range though — the further you are from the router, the weaker the signal. Thats why it works better in the same room.
4. What's the output of this C code?
Problem:
#include <stdio.h>
int main() {
    int a = 5;
    printf("%d %d %d", a, a++, ++a);
    return 0;
}
Solution A:
This is undefined behavior in C. The order of evaluation of function arguments is not guaranteed by the C standard. So the output depends on the compiler — it could be 5 5 7, 7 6 7, or something else entirely. Different compilers give different results. Never write code like this in practice.
Solution B:
Undefined behavior. The printf arguments can be evaluated in any order. Most common compilers might give 7 6 7 or 5 5 7 but its not reliable. The lesson: don't mix increment operators with other expressions in the same function call. Its a classic exam trick question though.
5. How do you study for exams?
Problem: Describe your study strategy for end-semester exams.
Solution A:
I usually start about 2 weeks before. First I go through all the notes and slides once to get an overview. Then I focus on topics I'm weak in. I prefer solving previous year papers — that gives a good idea of the pattern. I make short notes/formulas on one page for quick revision the night before. Studying with friends helps for subjects like OS and DBMS where discussing concepts makes more sense than just reading.
Solution B:
Honestly I start way too late. But what works for me is making bullet point notes while going through the syllabus, then doing previous year papers. Past papers are the GOAT — like 60-70% questions repeat or are similar. I also watch YouTube videos for topics I don't understand from class. The night before I just skim through my short notes. Cramming works for some subjects but for programming-based ones you actually need to practice.
6. What happens when you type google.com in a browser and press Enter?
Problem: Explain what happens step by step.
Solution A:
1. The browser checks its cache for the DNS record of google.com.
2. If not cached, a DNS query goes to resolve the domain to an IP address (like 142.250.x.x).
3. A TCP connection is established with the server (three-way handshake).
4. If HTTPS, a TLS handshake happens for encryption.
5. The browser sends an HTTP GET request for the homepage.
6. The server responds with HTML, CSS, JS files.
7. The browser parses HTML, builds DOM, renders the page.
8. Additional requests are made for images, scripts, stylesheets.
Solution B:
Your browser first needs to find where Google's servers are. It asks DNS (like a phonebook) for Google's IP address. Then it connects to that server using TCP (three-way handshake). If its HTTPS (which it is), they also do a TLS handshake to set up encryption. Then your browser sends a request saying "give me the homepage." Google's server sends back HTML, CSS, and JS files. Your browser reads the HTML, renders everything on screen, and loads any images or scripts. The whole thing happens in like a second.
7. You found a bug in your code the night before submission. What do you do?
Problem: You discover a bug in your project at 11 PM and submission is at 9 AM tomorrow. What's your approach?
Solution A:
First I'd assess how bad the bug is — does it break the whole thing or just one feature? If its critical, I'd try to fix it but set a deadline like 1 AM so I can still sleep. If I can't fix it, I'd at least document the issue and mention it in the submission. Sometimes commenting out the buggy part and adding a placeholder is better than submitting broken code. Sleep is important too — debugging tired usually makes things worse.
Solution B:
Depends on how complex the bug is. I'd try to reproduce it first and understand what's causing it. Spend like 2 hours max trying to fix it. If its something simple like an off-by-one error or wrong variable name, fix it and test. If it's a bigger logic issue, I'd try a workaround rather than rewriting. Also I'd commit whatever working code I have before attempting the fix — so I at least have a backup. And yeah, not pulling an all-nighter because being tired the next day is worse.
8. What is the difference between a file and a folder?
Problem: Explain to a 10-year-old the difference between a file and a folder.
Solution A:
A file is like a single piece of paper with something written on it — it could be a document, a photo, a song, anything. A folder is like a box or a cabinet where you keep those papers organized. You can put many files inside a folder. You can also put folders inside folders. For example, you might have a "Homework" folder with different files for Math, Science, and English. Without folders, all your files would be scattered in one place and impossible to find.
Solution B:
A file is one thing — like a photo, a song, or a document. A folder holds multiple files, like a container. Think of it like books and a bookshelf. Each book is a file, the shelf is the folder. You can also make folders inside folders (like having sections on your shelf for different subjects). Files have extensions like .txt, .jpg, .mp3 that tell the computer what type of file it is.
9. Write a Python program to check if a string is a palindrome
Problem: Check if a given string reads the same forwards and backwards.
Solution A:
def is_palindrome(s):
    s = s.lower().replace(" ", "")
    return s == s[::-1]
Solution B:
def is_palindrome(s):
    s = s.lower()
    s = s.replace(" ", "")
    left = 0
    right = len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True
10. Why do you want to do engineering?
Problem: Why did you choose engineering as your career?
Solution A:
Honestly, I was always curious about how things work — like how apps are built, how computers process things. Engineering felt like the right path to learn that. Also, there are good job opportunities after engineering, especially in tech. I didn't want to limit myself, and engineering gives a solid foundation even if I end up in a different field later.
Solution B:
I've been interested in computers since school. I used to play around with HTML and basic stuff when I was young. Engineering felt like the natural next step. Plus, the placement opportunities are good, and I like problem-solving. I know not everyone ends up doing exactly what they studied, but the analytical thinking you learn in engineering is useful everywhere.
11. What is the output of this Python code?
Problem:
a = [1, 2, 3]
b = a
b.append(4)
print(a)
Solution A:
[1, 2, 3, 4] — because b = a doesn't create a copy, it makes b reference the same list as a. So when you append to b, it modifies the same list. To avoid this, you'd need b = a.copy() or b = a[:].
Solution B:
Output is [1, 2, 3, 4]. In Python, lists are mutable and b = a creates a reference, not a copy. Both a and b point to the same object in memory. So b.append(4) changes the same list. If you wanted a separate copy, use b = a[:] or b = a.copy() or import copy; b = copy.deepcopy(a).
12. How do you handle group projects where one member doesn't contribute?
Problem: In a group project, one person isn't doing any work. What do you do?
Solution A:
First I'd talk to them directly — maybe they're going through something or they're confused about what to do. If they genuinely don't understand, I'd help them with their part. If they're just lazy, I'd politely tell the rest of the group to divide their work among ourselves and then mention it to the professor if needed. Documenting who did what is important too, especially for internal marking.
Solution B:
I'd first try to talk to them personally. Maybe they don't understand the task or have something going on. If nothing changes after that, I'd redistribute the work among the remaining members and just do the best we can. I wouldn't go to the professor immediately — that feels like snitching. But if its affecting our grade and they still don't contribute after being talked to, I'd be honest with the professor about the contribution split.
13. What's the difference between RAM and storage?
Problem: Explain the difference between RAM and hard drive/SSD storage.
Solution A:
RAM (Random Access Memory) is your computer's short-term memory — it holds data that the CPU is actively using. It's very fast but temporary — everything in RAM is lost when you shut down. Storage (HDD/SSD) is long-term memory — your files, apps, OS stay there even when powered off. RAM is like your desk where you keep things you're currently working on. Storage is like a filing cabinet. That's why more RAM means you can run more programs simultaneously, while more storage means you can save more files.
Solution B:
RAM is temporary memory — fast but erased when you turn off the PC. Storage (HDD/SSD) is permanent — slower but keeps your data. Think of RAM as your working table and storage as your cupboard. When you open a program, it loads from storage into RAM so the CPU can access it quickly. More RAM = smoother multitasking. More storage = more space for files. RAM is like 8-16 GB in most laptops, storage is 256GB-1TB.
14. Write a C program to check if a number is positive, negative, or zero
Problem: Take an integer input and print whether it's positive, negative, or zero.
Solution A:
#include <stdio.h>
int main() {
    int n;
    printf("Enter a number: ");
    scanf("%d", &n);
    if (n > 0)
        printf("Positive");
    else if (n < 0)
        printf("Negative");
    else
        printf("Zero");
    return 0;
}
Solution B:
#include <stdio.h>
int main() {
    int num;
    scanf("%d", &num);
    if (num > 0) printf("%d is positive\n", num);
    else if (num < 0) printf("%d is negative\n", num);
    else printf("Number is zero\n");
    return 0;
}
15. Why is Python popular among beginners?
Problem: Why do you think Python is recommended for beginners?
Solution A:
Python syntax is very close to English, so it's easy to read and write. Unlike C or Java, you don't need to deal with complex syntax like semicolons, braces, or type declarations. A lot of things are handled by built-in functions — like sorting a list is just sorted(). Also the community is massive, so whenever you're stuck, there's always a Stack Overflow answer or YouTube tutorial. Libraries for everything — web dev, data science, automation — makes it versatile.
Solution B:
The syntax is simple and clean. No braces, no semicolons, no need to declare variable types. print("Hello") is literally one line. Compare that to C where you need #include, int main(), printf, return 0, etc. just for hello world. Python lets you focus on logic rather than syntax rules. Plus, huge community, tons of tutorials, and it's used in almost every field — web, data science, AI, automation. So you learn one language and can go in many directions.
16. You're stuck on a coding problem for over an hour. What do you do?
Problem: You've been trying to solve a coding problem and you're stuck. What's your next step?
Solution A:
Step away for 5-10 minutes. Seriously, just take a break and come back with fresh eyes. Then try re-reading the problem statement — sometimes you misunderstood something. If still stuck, look at hints (not full solutions) on sites like LeetCode or GeeksforGeeks. If its a specific error, Google the exact error message. If nothing works, ask a friend or post on Stack Overflow with your code and what you've tried.
Solution B:
I'd first re-read the problem carefully — half the time I missed some edge case or constraint. Then try breaking it into smaller parts and solve step by step. If I'm still stuck, I look at similar problems for patterns. If its a syntax/logic error, rubber duck debugging helps — explain your code line by line to someone (or even to yourself) and you'll often spot the bug. After like 1.5-2 hours of being stuck, its okay to look at solutions and learn from them instead of wasting time.
17. What is the difference between a compiler and an interpreter?
Problem: Explain compiler vs interpreter in simple terms.
Solution A:
A compiler translates the whole program to machine code at once before running it. Like translating an entire book before giving it to someone. An interpreter translates and runs line by line. Like having a live translator in a conversation. Compiled programs (like C) run faster. Interpreted programs (like Python) are easier to debug since errors show up line by line. Java is a mix — compiles to bytecode then the JVM interprets it.
Solution B:
Compiler: reads entire code, converts to machine code, then runs. You see all errors after compilation. Interpreter: runs code line by line, shows errors as it goes. Compiler = faster execution (C uses gcc). Interpreter = easier to test and debug (Python). Some languages like Java use both.
18. How do you manage your time between college, assignments, and personal life?
Problem: How do you balance college studies, assignments, and your personal life?
Solution A:
Honestly it's not always balanced. But what helps is having a rough routine — I try to attend all lectures so I don't fall behind, which saves time later. For assignments, I start at least a few days before the deadline instead of the night before. Weekends I try to keep half for study and half for personal stuff. I also use Google Calendar to track deadlines. Some weeks are chaotic during exams but overall having a rough schedule helps more than no schedule.
Solution B:
I try to use the time between classes productively instead of scrolling my phone. For assignments, I set small daily goals instead of trying to do everything at once. I also prioritize — if there's an assignment due tomorrow, that comes before watching a movie. For personal life, I make sure I have time for friends and hobbies because burnout is real. Not everything needs to be perfect — sometimes a B+ assignment and a happy you is better than an A+ assignment and zero sleep.
19. What's the difference between HTTP and HTTPS?
Problem: What's the difference between HTTP and HTTPS?
Solution A:
HTTP (HyperText Transfer Protocol) transfers data between your browser and the website in plain text — anyone intercepting can read it. HTTPS (HTTP Secure) adds a layer of encryption using SSL/TLS certificates, so the data is encrypted and can't be read by intermediaries. That padlock icon in the browser means HTTPS. HTTPS also verifies the website's identity through certificates, preventing man-in-the-middle attacks. That's why you should only enter passwords and payment info on HTTPS sites. Most websites today use HTTPS by default.
Solution B:
The "S" stands for Secure. HTTP sends data in plain text — anyone can intercept and read it. HTTPS encrypts the data using SSL/TLS, so even if someone intercepts it, they can't read it. You'll see a padlock icon in the address bar for HTTPS sites. Important for banking, shopping, login pages — basically anywhere you enter sensitive info. Most modern sites use HTTPS now, and browsers even warn you if a site uses HTTP.
20. Write a Python program to find the largest of three numbers
Problem: Take three numbers and print the largest.
Solution A:
a = int(input("Enter first number: "))
b = int(input("Enter second number: "))
c = int(input("Enter third number: "))
if a >= b and a >= c:
    print(f"{a} is the largest")
elif b >= a and b >= c:
    print(f"{b} is the largest")
else:
    print(f"{c} is the largest")
Solution B:
a, b, c = 10, 25, 15
largest = max(a, b, c)
print("Largest is", largest)
Answer Key (shuffled — unpredictable)
Q#	Answer A	Answer B
1	Human	AI
2	AI	Human
3	AI	Human
4	Human	AI
5	AI	Human
6	Human	AI
7	Human	AI
8	AI	Human
9	AI	Human
10	Human	AI
11	Human	AI
12	Human	AI
13	AI	Human
14	Human	AI
15	AI	Human
16	AI	Human
17	Human	AI
18	Human	AI
19	AI	Human
20	Human	AI
What makes it confusing:
- Sometimes AI sounds more casual, sometimes human sounds more structured
- Both answers are correct and well-explained
- No obvious "robot" or "human" tells — the subtle differences are in phrasing, word choice, level of detail, and personality
- Some answers swap expectations (AI giving a casual answer, human giving a formal one)
