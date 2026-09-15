import flatQuestions from './data/round2-flat-questions.json';

// Curated time-taking complex dry-run questions for Bonus Round
const TIME_TAKING_BONUS_QUESTIONS = [
  {
    id: 'BONUS_01',
    cat: 'C (Pointers & Memory)',
    bonus: true,
    q: 'What is the exact output of this C code snippet?\n\n#include <stdio.h>\nint main() {\n    int a[] = {10, 20, 30, 40, 50};\n    int *p = a + 1;\n    int **pp = &p;\n    (*p)++;\n    printf("%d %d", *p, *(*pp + 1));\n    return 0;\n}',
    o: ['21 30', '20 30', '21 21', '20 40'],
    a: 0,
  },
  {
    id: 'BONUS_02',
    cat: 'Python (Nested Comprehensions)',
    bonus: true,
    q: 'What does this Python list comprehension evaluate to?\n\nresult = [x * y for x in range(3) for y in range(x) if (x + y) % 2 == 0]\nprint(result)',
    o: ['[0, 0]', '[0]', '[0, 2]', '[2, 4]'],
    a: 0,
  },
  {
    id: 'BONUS_03',
    cat: 'Java (Static & Instance Blocks)',
    bonus: true,
    q: 'What is printed when this Java program runs?\n\nclass Test {\n    static int x = 10;\n    {\n        x += 5;\n    }\n    static {\n        x *= 2;\n    }\n    public static void main(String[] args) {\n        Test t1 = new Test();\n        Test t2 = new Test();\n        System.out.println(t1.x + " " + t2.x);\n    }\n}',
    o: ['30 30', '25 30', '20 20', '35 35'],
    a: 0,
  },
  {
    id: 'BONUS_04',
    cat: 'C (Bitwise & Shifting)',
    bonus: true,
    q: 'Trace the value of `ans` after executing this C code:\n\nint x = 29; // binary: 0001 1101\nint y = (x & 15) << 2;\nint ans = (y ^ 7) >> 1;\nprintf("%d", ans);',
    o: ['25', '27', '51', '13'],
    a: 0,
  },
  {
    id: 'BONUS_05',
    cat: 'Recursion & Stack Tracing',
    bonus: true,
    q: 'What is returned by calling `solve(4, 3)`?\n\nint solve(int m, int n) {\n    if (m == 0) return n + 1;\n    if (n == 0) return solve(m - 1, 1);\n    return solve(m - 1, solve(m, n - 1));\n}',
    o: ['253 (Ackermann Function)', '13', '120', 'Infinite Recursion'],
    a: 0,
  },
  {
    id: 'BONUS_06',
    cat: 'Python (Generators & Mutability)',
    bonus: true,
    q: 'What is the output of the following Python snippet?\n\ndef gen():\n    nums = [1, 2, 3]\n    for x in nums:\n        nums.append(x + 10)\n        yield x\n        if len(nums) > 6: break\nprint(list(gen()))',
    o: ['[1, 2, 3, 11]', '[1, 2, 3]', '[1, 2, 3, 11, 12, 13]', 'RuntimeError (list modified during iteration)'],
    a: 0,
  },
  {
    id: 'BONUS_07',
    cat: 'Java (Method Overriding & Polymorphism)',
    bonus: true,
    q: 'What is the output of the following Java code?\n\nclass Parent {\n    int val = 100;\n    void show() { System.out.print(val + " "); }\n}\nclass Child extends Parent {\n    int val = 200;\n    void show() { System.out.print(val + " "); }\n}\npublic class Main {\n    public static void main(String[] args) {\n        Parent p = new Child();\n        System.out.print(p.val + " ");\n        p.show();\n    }\n}',
    o: ['100 200', '200 200', '100 100', '200 100'],
    a: 0,
  }
];

// Fisher-Yates shuffle
export function shuffleArray(arr, randomFn = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Simple seeded PRNG for consistent team sessions
function createSeededRandom(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

// Group all questions by category
const questionsByCategory = {};
flatQuestions.forEach((item) => {
  const cat = item.category;
  if (!questionsByCategory[cat]) questionsByCategory[cat] = [];
  questionsByCategory[cat].push(item);
});

/**
 * Generates a strictly non-repeating set:
 * - 25 Standard Questions (5 Python, 5 C, 5 Java, 5 Logic, 5 General Tech)
 * - 5 Bonus Questions (time-consuming dry runs: +150 correct / -5 wrong)
 * Total: 30 unique questions (NO repetition ever).
 */
export function generateBalancedSet(seed = '') {
  const rng = seed ? createSeededRandom(seed) : Math.random;

  const distribution = {
    Python: 5,
    C: 5,
    Java: 5,
    Logic: 5,
    'General Tech': 5,
  };

  const standardQuestions = [];

  for (const [cat, count] of Object.entries(distribution)) {
    const pool = (questionsByCategory[cat] || []).filter((q) => !q.isBonus);
    const shuffledPool = shuffleArray(pool, rng);
    const chosen = shuffledPool.slice(0, count);

    chosen.forEach((q) => {
      const optionsWithId = q.options.map((opt, idx) => ({
        text: opt.text,
        isCorrect: opt.id === q.correctOptionId || idx === q.correctOptionId,
      }));

      const shuffledOptions = shuffleArray(optionsWithId, rng);
      const correctIndex = shuffledOptions.findIndex((o) => o.isCorrect);

      standardQuestions.push({
        id: q.id,
        cat: q.category,
        bonus: false,
        q: q.question,
        o: shuffledOptions.map((o) => o.text),
        a: correctIndex >= 0 ? correctIndex : 0,
      });
    });
  }

  // Intermix standard 25 questions
  const shuffledStandard = shuffleArray(standardQuestions, rng);

  // Pick 5 distinct time-taking bonus questions
  const shuffledBonusPool = shuffleArray(TIME_TAKING_BONUS_QUESTIONS, rng);
  const bonusQuestions = shuffledBonusPool.slice(0, 5).map((q) => {
    const options = q.o.map((text, idx) => ({ text, isCorrect: idx === q.a }));
    const shuffledOptions = shuffleArray(options, rng);
    const correctIndex = shuffledOptions.findIndex((o) => o.isCorrect);
    return {
      id: q.id,
      cat: q.cat,
      bonus: true,
      q: q.q,
      o: shuffledOptions.map((o) => o.text),
      a: correctIndex >= 0 ? correctIndex : 0,
    };
  });

  return {
    standardQuestions: shuffledStandard,
    bonusQuestions,
    allQuestions: [...shuffledStandard, ...bonusQuestions],
  };
}
