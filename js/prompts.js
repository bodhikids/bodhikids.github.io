// Age range constants
const AGE_RANGES = {
    TODDLER: '1-3',
    PRESCHOOL: '4-6',
    SCHOOL: '7-9',
    PRETEEN: '10-12',
    TEEN: '13-15'
};

// Module visibility rules
const MODULE_RULES = {
    reading: { minAge: 4, maxAge: 9 },
    math: { minAge: 1, maxAge: 15 },
    logic: { minAge: 1, maxAge: 15 },
    rhyming: { minAge: 4, maxAge: 7 },
    spelling: { minAge: 10, maxAge: 15 },
    'emoji-riddles': { minAge: 5, maxAge: 7 },
    coding: { minAge: 5, maxAge: 15 },
    ai: { minAge: 5, maxAge: 15 },
    science: { minAge: 5, maxAge: 15 },
    phonics: { minAge: 3, maxAge: 7 }
};

export function getAgeRange(age) {
    if (age >= 1 && age <= 3) return AGE_RANGES.TODDLER;
    if (age >= 4 && age <= 6) return AGE_RANGES.PRESCHOOL;
    if (age >= 7 && age <= 9) return AGE_RANGES.SCHOOL;
    if (age >= 10 && age <= 12) return AGE_RANGES.PRETEEN;
    if (age >= 13 && age <= 15) return AGE_RANGES.TEEN;
    return '';
}

export function isModuleAvailable(moduleType, age) {
    const rules = MODULE_RULES[moduleType];
    if (!rules) return true; // If no rules defined, module is always available
    return age >= rules.minAge && age <= rules.maxAge;
}

export function getAvailableModules(age) {
    const modules = {};
    for (const [moduleType, rules] of Object.entries(MODULE_RULES)) {
        modules[moduleType] = isModuleAvailable(moduleType, age);
    }
    return modules;
}

export function getPrompt(age, moduleType, theme = null, difficulty = 1) {
    const ageRange = getAgeRange(age);
    let prompt = '';

    // If module is not available for this age, return empty prompt
    if (!isModuleAvailable(moduleType, age)) {
        return '';
    }

    const baseJsonStructure = `Please provide the output in a single, valid JSON object with two keys: "story" and "questions".
- The "story" should be in Markdown format.
- The "questions" should be an array of objects, where each object has "question", "options" (an array of 4 strings), and "answer" (the 0-based index of the correct option).`;

    const themeInstruction = `The theme for the content should be: ${theme}.`;
    const difficultyInstruction = `The difficulty level should be ${difficulty} out of 5.`;

    if (moduleType === 'math') {
        switch (ageRange) {
            case AGE_RANGES.TODDLER:
                prompt = `Create a simple counting module for a toddler (age ${age}). ${themeInstruction} ${difficultyInstruction}
                ${baseJsonStructure}
                - The "story" should be a very short title or a single sentence, like "## Let's Count! 🔢".
                - The "questions" should be 3-4 simple questions about counting 1-5 objects, using emojis. Example: "How many apples do you see? 🍎🍎"`;
                break;
            case AGE_RANGES.PRESCHOOL:
                prompt = `Create a basic addition and subtraction module for a young child (age ${age}). ${themeInstruction} ${difficultyInstruction}
                ${baseJsonStructure}
                - The "story" should be a short title or a single sentence, like "## Math Adventure! ➕".
                - The "questions" should be 5-7 simple problems involving addition and subtraction up to 10. Example: "3 + 4 = ?"`;
                break;
            case AGE_RANGES.SCHOOL:
                prompt = `Create a math module with multiplication and division for a child (age ${age}). ${themeInstruction} ${difficultyInstruction}
                ${baseJsonStructure}
                - The "story" should be a short title or a single sentence, like "## Brainy Math! 🧠".
                - The "questions" should be 5-7 problems including addition, subtraction, and simple multiplication/division. Example: "4 x 5 = ?"`;
                break;
            case AGE_RANGES.PRETEEN:
                prompt = `Create a math module with word problems for a pre-teen (age ${age}). ${themeInstruction} ${difficultyInstruction}
                ${baseJsonStructure}
                - The "story" should be a short title or a single sentence, like "## Math Puzzles! 🧩".
                - The "questions" should be 5-7 problems including multi-step arithmetic and complex word problems. Example: "If a train travels at 60 mph, how far does it go in 3 hours?"`;
                break;
        }
    } else if (moduleType === 'logic') {
        switch (ageRange) {
            case AGE_RANGES.TODDLER:
                prompt = `Create a simple "what comes next?" sequencing module for a toddler (age ${age}). ${themeInstruction} ${difficultyInstruction}
                ${baseJsonStructure}
                - The "story" should be a very short title or a single sentence, like "## What's Next? 🤔".
                - The "questions" should be 3-4 simple questions about daily routines or simple patterns using emojis. Example: "First you wake up 🛌, then you eat breakfast 🥞. What's next?", with options like "Go to sleep 😴", "Brush your teeth 😁", "Play with toys 🧸".`;
                break;
            case AGE_RANGES.PRESCHOOL:
                prompt = `Create a "sequence of events" logic module for a young child (age ${age}). ${themeInstruction} ${difficultyInstruction}
                ${baseJsonStructure}
                - The "story" should be a short title or a single sentence, like "## Order the Story! 📜".
                - The "questions" should present a simple 3-step story (e.g., planting a seed) and ask the child to identify the first, middle, or last step. Example: "To make a sandwich, what is the FIRST step?", with options like "Eat the sandwich", "Put jelly on bread", "Get two slices of bread".`;
                break;
            case AGE_RANGES.SCHOOL:
                prompt = `Create a basic "if-then" conditional logic module for a child (age ${age}). ${themeInstruction} ${difficultyInstruction}
                ${baseJsonStructure}
                - The "story" should be a short title or a single sentence, like "## If This, Then That! 🤖".
                - The "questions" should be 4-6 more complex conditional scenarios. Example: "IF it is raining outside, THEN you should bring...", with options like "A kite", "Sunglasses", "An umbrella", "A bucket".`;
                break;
            case AGE_RANGES.PRETEEN:
                prompt = `Create a simple "algorithmic thinking" module for a pre-teen (age ${age}). ${themeInstruction} ${difficultyInstruction}
                ${baseJsonStructure}
                - The "story" should be a short title or a single sentence, like "## Plan the Steps! 🗺️".
                - The "questions" should be 4-6 challenging problems that require breaking down a task into a logical sequence of steps. Example: "You want to make a robot draw a square. What is the correct sequence of commands?", with options showing different orders of 'pen down', 'move forward', 'turn right', 'pen up'.`;
                break;
        }
    } else if (moduleType === 'reading') {
        switch (ageRange) {
            case AGE_RANGES.PRESCHOOL:
                prompt = `Create a short story comprehension module for a young child (age ${age}). ${themeInstruction} ${difficultyInstruction}
                ${baseJsonStructure}
                - The "story" should be a very short, simple paragraph with a clear narrative.
                - The "questions" should be 3-5 questions about the main characters and events in the story.`;
                break;
            case AGE_RANGES.SCHOOL:
                prompt = `Create a reading comprehension module with a focus on vocabulary for a child (age ${age}). ${themeInstruction} ${difficultyInstruction}
                ${baseJsonStructure}
                - The "story" should be a short paragraph with some more complex words.
                - The "questions" should be 4-6 questions. They should test comprehension and ask about the meaning of one or two words from the story.`;
                break;
        }
    } else if (moduleType === 'rhyming') {
        prompt = `Create a rhyming words module for a child (age ${age}). ${themeInstruction} ${difficultyInstruction}
        ${baseJsonStructure}
        - The "story" should be a title like "## Rhyme Time! 🎤".
        - The "questions" should be 5-7 questions asking to find a word that rhymes with a given word. Example: "Which word rhymes with 'cat'?", with options like "hat", "dog", "sun".`;
    } else if (moduleType === 'spelling') {
        prompt = `Create a spelling bee module for a child (age ${age}). ${themeInstruction} ${difficultyInstruction}
        Please provide the output in a single, valid JSON object with two keys: "story" and "words".
        - The "story" should be a title like "## Spelling Bee! 🐝".
        - The "words" should be an array of exactly 5 age-appropriate spelling words.`;
    } else if (moduleType === 'emoji-riddles') {
        prompt = `Create an emoji riddles module for a child (age ${age}). ${themeInstruction} ${difficultyInstruction}
        ${baseJsonStructure}
        - The "story" should be a title like "## Emoji Riddles! 🤔".
        - The "questions" should be 5-7 riddles made of emojis. The answer should be a common object or animal. Example: "I am yellow, I grow on trees, and monkeys love me. 🍌", with the question "What am I?".`;
    } else if (moduleType === 'coding') {
        switch (ageRange) {
            case AGE_RANGES.PRESCHOOL: // Ages 5-6
                prompt = `Create a very simple, visual coding logic module for a young child (age ${age}). ${themeInstruction} ${difficultyInstruction}
                ${baseJsonStructure}
                - The "story" should be a title like "## Tell the Robot What to Do! 🤖".
                - The "questions" should be 4-5 questions about sequencing simple, real-world tasks. Use emojis heavily. Example: "To get a glass of juice, what is the FIRST step?", with options like "Drink the juice 🧃", "Pour the juice 🫗", "Get a cup 🥛".`;
                break;
            case AGE_RANGES.SCHOOL: // Ages 7-9
                prompt = `Create a basic coding concepts module for a child (age ${age}) using analogies. ${themeInstruction} ${difficultyInstruction}
                ${baseJsonStructure}
                - The "story" should be a title like "## Code Puzzles! 🧩".
                - The "questions" should be 5-6 questions explaining concepts like 'if/then' statements and 'loops' with simple stories. Example: "IF it's your birthday, THEN you get presents. It's your birthday today! What happens?", with options like "You give presents", "You get presents", "Nothing happens".`;
                break;
            case AGE_RANGES.PRETEEN:
            case AGE_RANGES.TEEN: // Ages 10-15
                prompt = `Create a language-independent coding concepts module for a child aged ${age}. ${themeInstruction} ${difficultyInstruction}
                ${baseJsonStructure}
                - The "story" should be a title like "## Code Breakers! 💻".
                - The "questions" should be 5-7 questions about fundamental programming concepts like loops, conditionals, variables, and functions, using pseudocode or real-world analogies. Example: "A 'loop' in coding is like...", with options like "A straight line", "Doing something once", "Repeating an action", "A type of variable".`;
                break;
        }
    } else if (moduleType === 'ai') {
        switch (ageRange) {
            case AGE_RANGES.PRESCHOOL: // Ages 5-6
                prompt = `Create a very simple "what is AI?" module for a young child (age ${age}). ${themeInstruction} ${difficultyInstruction}
                ${baseJsonStructure}
                - The "story" should be a title like "## Smart Helpers! 🤖".
                - The "questions" should be 4-5 questions using analogies to things they know. Example: "Which of these is like a smart helper that can learn?", with options like "A smart speaker that plays music you like", "A teddy bear", "A bicycle".`;
                break;
            case AGE_RANGES.SCHOOL: // Ages 7-9
                prompt = `Create a basic AI concepts module for a child (age ${age}) explaining how AI learns. ${themeInstruction} ${difficultyInstruction}
                ${baseJsonStructure}
                - The "story" should be a title like "## How Do Computers Learn? 🤔".
                - The "questions" should be 5-6 questions using simple examples. Example: "You show a computer many pictures of cats to teach it. This is called...", with options like "Guessing", "Training", "Drawing", "Playing".`;
                break;
            case AGE_RANGES.PRETEEN:
            case AGE_RANGES.TEEN: // Ages 10-15
                prompt = `Create an introductory module on different types of AI for a child aged ${age}. ${themeInstruction} ${difficultyInstruction}
                ${baseJsonStructure}
                - The "story" should be a title like "## Exploring AI Worlds! 🌍".
                - The "questions" should be 5-7 questions about different AI applications. Example: "An AI that can understand and translate languages is a type of...", with options like "Image Recognition AI", "Game Playing AI", "Natural Language Processing AI", "Self-Driving Car AI".`;
                break;
        }
    } else if (moduleType === 'science') {
        switch (ageRange) {
            case AGE_RANGES.PRESCHOOL: // Ages 5-6
                prompt = `Create a simple science module about the natural world for a young child (age ${age}). ${themeInstruction} ${difficultyInstruction}
                ${baseJsonStructure}
                - The "story" should be a title like "## Nature Detectives! 🌳".
                - The "questions" should be 4-5 questions about basic concepts like weather, plants, or animals. Example: "What do plants need to grow?", with options like "Sunlight and water", "Cookies and milk", "Toys and books".`;
                break;
            case AGE_RANGES.SCHOOL: // Ages 7-9
                prompt = `Create a basic STEM concepts module for a child (age ${age}). ${themeInstruction} ${difficultyInstruction}
                ${baseJsonStructure}
                - The "story" should be a title like "## Fun Experiments! 🧪".
                - The "questions" should be 5-6 questions about simple physics or biology. Example: "What happens to water when it gets very cold?", with options like "It turns to steam", "It turns to ice", "It disappears".`;
                break;
            case AGE_RANGES.PRETEEN:
            case AGE_RANGES.TEEN: // Ages 10-15
                prompt = `Create an introductory module on a core science topic for a child aged ${age}. ${themeInstruction} ${difficultyInstruction}
                ${baseJsonStructure}
                - The "story" should be a title like "## Science Investigators! 🔬".
                - The "questions" should be 5-7 questions about topics like the solar system, basic chemistry, or the scientific method. Example: "What is the force that keeps us on the ground?", with options like "Magnetism", "Gravity", "Friction", "Electricity".`;
                break;
        }
    } else if (moduleType === 'phonics') {
        const phonicsJsonStructure = `Please provide the output in a single, valid JSON object with two keys: "story" and "questions".
- The "story" should be in Markdown format.
- The "questions" should be an array of objects, where each object has "question", "options" (an array of 4 strings), "answer" (the 0-based index of the correct option), and "speak" (the single letter, sound, or word to be spoken).

IMPORTANT: Return ONLY valid JSON. No additional text, explanations, or code blocks.

Example JSON format:
{
  "story": "## ABC Sound Party! 🎉\\n\\nLet's learn letter sounds together!",
  "questions": [
    {
      "question": "The letter 'B' makes a sound like a...",
      "options": ["Ball ⚽", "Cat 🐈", "Dog 🐕", "Fish 🐠"],
      "answer": 0,
      "speak": "buh"
    }
  ]
}`;

        switch (theme) {
            case 'abc':
                prompt = `Create a "letter sounds" module for a child (age ${age}). ${difficultyInstruction}
                ${phonicsJsonStructure}
                - The "story" should be a title like "## ABC Sound Party! 🎉".
                - The "questions" should be 5-7 questions asking for the sound a letter makes. Use emojis.
                - The "speak" field is crucial: it must contain the common phonetic sound of the letter, not the letter's name.
                - Example Question: "The letter 'C' makes a sound like a..." with options like "Cat 🐈", "Dog 🐕", "Bird 🐦".
                - For this example, the "speak" field must be "kuh" (the sound of 'c' in 'cat'), NOT "cee".
                - Another example: For the letter 'A', the "speak" field should be "ah" as in 'apple'.`;
                break;
            case 'words':
                prompt = `Create a "blending sounds" phonics module for a child (age ${age}). ${difficultyInstruction}
                ${phonicsJsonStructure}
                - The "story" should be a title like "## Let's Make Words! 🧩".
                - The "questions" should be 5-7 questions asking the child to blend simple CVC (consonant-vowel-consonant) words. Example: "What word do the sounds /c/ /a/ /t/ make?", with options like "mat", "cat", "bat". The "speak" field should contain the word, e.g., "cat".`;
                break;
            case 'digraphs':
                prompt = `Create a phonics module on "digraphs" (like sh, ch, th) for a child (age ${age}). ${difficultyInstruction}
                ${phonicsJsonStructure}
                - The "story" should be a title like "## Super Sounds! 🦸".
                - The "questions" should be 5-7 questions asking to identify words with specific digraphs.
                - The "speak" field is crucial: it must contain the blended sound of the digraph, not the individual letters.
                - Example Question: "Which of these words has the 'sh' sound?", with options like "ship", "chair", "thumb".
                - For this example, the "speak" field must be "shhh", NOT "s" and "h".
                - Another example: For 'th', the "speak" field should be "the".`;
                break;
            case 'vowel-teams':
                prompt = `Create a phonics module on "vowel teams" (like ae, ai, ea, ee, oa, ou) for a child (age ${age}). ${difficultyInstruction}
                ${phonicsJsonStructure}
                - The "story" should be a title like "## Vowel Teams! 👥".
                - The "questions" should be 5-7 questions asking to identify words with vowel teams or choose the correct vowel team sound.
                - The "speak" field should contain the vowel team sound (like "ay" for 'ai', "ee" for 'ea').
                - Example Question: "Which word has the 'ai' sound like in 'rain'?", with options like "pain", "pen", "pin", "pan".
                - For this example, the "speak" field should be "ay" (the long 'a' sound).
                - Focus on common vowel teams: ai/ay (long a), ea/ee (long e), oa/ow (long o), ou/ow (ou sound).`;
                break;
            case 'blends':
                prompt = `Create a phonics module on "consonant blends" (like bl, cl, fl, sl, br, cr, dr, fr, gr, pr, tr, st, sp, sk) for a child (age ${age}). ${difficultyInstruction}
                ${phonicsJsonStructure}
                - The "story" should be a title like "## Blending Sounds! 🌟".
                - The "questions" should be 5-7 questions asking to identify words that start with specific blends.
                - The "speak" field should contain the blended consonant sound (like "bl" for blend, "st" for stop).
                - Example Question: "Which word starts with the 'bl' blend?", with options like "blue", "bus", "cat", "dog".
                - For this example, the "speak" field should be "bl" (both consonants blended together).
                - Focus on common initial blends: bl, cl, fl, sl (l-blends), br, cr, dr, fr, gr, pr, tr (r-blends), st, sp, sk, sm, sn (s-blends).`;
                break;
            default:
                // Default phonics prompt if theme is not recognized
                prompt = `Create a basic phonics module for a child (age ${age}). ${difficultyInstruction}
                ${phonicsJsonStructure}
                - The "story" should be a title like "## Phonics Fun! 🎵".
                - The "questions" should be 5-7 basic phonics questions appropriate for the age.
                - Include the "speak" field with the appropriate sound for each question.`;
                break;
        }
    }
    return prompt;
}