export function getAgeRange(age) {
    let ageRange = '';

    if (age >= 1 && age <= 3) {
        ageRange = '1-3';
    } else if (age >= 4 && age <= 6) {
        ageRange = '4-6';
    } else if (age >= 7 && age <= 9) {
        ageRange = '7-9';
    } else if (age >= 10 && age <= 12) {
        ageRange = '10-12';
    }

    return ageRange;
}

export function getPrompt(age, moduleType) {
    const ageRange = getAgeRange(age);
    let prompt = '';

    const baseJsonStructure = `Please provide the output in a single, valid JSON object with two keys: "story" and "questions".
- The "story" should be in Markdown format.
- The "questions" should be an array of objects, where each object has "question", "options" (an array of 4 strings), and "answer" (the 0-based index of the correct option).`;

    if (moduleType === 'math') {
        switch (ageRange) {
            case '1-3':
                prompt = `Create a simple counting module for a toddler (age ${age}).
                ${baseJsonStructure}
                - The "story" should be a very short title or a single sentence, like "## Let's Count! 🔢".
                - The "questions" should be 3-4 simple questions about counting 1-5 objects, using emojis. Example: "How many apples do you see? 🍎🍎"`;
                break;
            case '4-6':
                prompt = `Create a basic addition and subtraction module for a young child (age ${age}).
                ${baseJsonStructure}
                - The "story" should be a short title or a single sentence, like "## Math Adventure! ➕".
                - The "questions" should be 5-7 simple problems involving addition and subtraction up to 10. Example: "3 + 4 = ?"`;
                break;
            case '7-9':
                prompt = `Create a math module with multiplication and division for a child (age ${age}).
                ${baseJsonStructure}
                - The "story" should be a short title or a single sentence, like "## Brainy Math! 🧠".
                - The "questions" should be 5-7 problems including addition, subtraction, and simple multiplication/division. Example: "4 x 5 = ?"`;
                break;
            case '10-12':
                prompt = `Create a math module with word problems for a pre-teen (age ${age}).
                ${baseJsonStructure}
                - The "story" should be a short title or a single sentence, like "## Math Puzzles! 🧩".
                - The "questions" should be 5-7 problems including multi-step arithmetic and complex word problems. Example: "If a train travels at 60 mph, how far does it go in 3 hours?"`;
                break;
        }
    } else if (moduleType === 'logic') {
        switch (ageRange) {
            case '1-3':
                prompt = `Create a simple "what comes next?" sequencing module for a toddler (age ${age}).
                ${baseJsonStructure}
                - The "story" should be a very short title or a single sentence, like "## What's Next? 🤔".
                - The "questions" should be 3-4 simple questions about daily routines or simple patterns using emojis. Example: "First you wake up 🛌, then you eat breakfast 🥞. What's next?", with options like "Go to sleep 😴", "Brush your teeth 😁", "Play with toys 🧸".`;
                break;
            case '4-6':
                prompt = `Create a "sequence of events" logic module for a young child (age ${age}).
                ${baseJsonStructure}
                - The "story" should be a short title or a single sentence, like "## Order the Story! 📜".
                - The "questions" should present a simple 3-step story (e.g., planting a seed) and ask the child to identify the first, middle, or last step. Example: "To make a sandwich, what is the FIRST step?", with options like "Eat the sandwich", "Put jelly on bread", "Get two slices of bread".`;
                break;
            case '7-9':
                prompt = `Create a basic "if-then" conditional logic module for a child (age ${age}).
                ${baseJsonStructure}
                - The "story" should be a short title or a single sentence, like "## If This, Then That! 🤖".
                - The "questions" should be 4-6 more complex conditional scenarios. Example: "IF it is raining outside, THEN you should bring...", with options like "A kite", "Sunglasses", "An umbrella", "A bucket".`;
                break;
            case '10-12':
                prompt = `Create a simple "algorithmic thinking" module for a pre-teen (age ${age}).
                ${baseJsonStructure}
                - The "story" should be a short title or a single sentence, like "## Plan the Steps! 🗺️".
                - The "questions" should be 4-6 challenging problems that require breaking down a task into a logical sequence of steps. Example: "You want to make a robot draw a square. What is the correct sequence of commands?", with options showing different orders of 'pen down', 'move forward', 'turn right', 'pen up'.`;
                break;
        }
    } else if (moduleType === 'reading') {
        switch (ageRange) {
            case '1-3':
                prompt = `Create a simple object/animal recognition module for a toddler (age ${age}).
                ${baseJsonStructure}
                - The "story" should be a very short, one or two-sentence story using simple words and emojis. Example: "The little duck 🦆 says quack!"
                - The "questions" should be 3-4 simple questions about the story, focusing on recognition. Example: "What animal did you read about?"`;
                break;
            case '4-6':
                prompt = `Create a short story comprehension module for a young child (age ${age}).
                ${baseJsonStructure}
                - The "story" should be a very short, simple paragraph with a clear narrative.
                - The "questions" should be 3-5 questions about the main characters and events in the story.`;
                break;
            case '7-9':
                prompt = `Create a reading comprehension module with a focus on vocabulary for a child (age ${age}).
                ${baseJsonStructure}
                - The "story" should be a short paragraph with some more complex words.
                - The "questions" should be 4-6 questions. They should test comprehension and ask about the meaning of one or two words from the story.`;
                break;

            case '10-12':
                prompt = `Create a reading module with a focus on inference for a pre-teen (age ${age}).
                ${baseJsonStructure}
                - The "story" should be a short, complex narrative that requires the reader to infer character feelings or motivations.
                - The "questions" should include 4-6 questions about what happened and why characters might have done certain things, focusing on deeper inference.`;
                break;
        }
    } else if (moduleType === 'rhyming') {
        prompt = `Create a rhyming words module for a child (age ${age}).
        ${baseJsonStructure}
        - The "story" should be a title like "## Rhyme Time! 🎤".
        - The "questions" should be 5-7 questions asking to find a word that rhymes with a given word. Example: "Which word rhymes with 'cat'?", with options like "hat", "dog", "sun".`;
    } else if (moduleType === 'spelling') {
        prompt = `Create a spelling bee module for a child (age ${age}).
        Please provide the output in a single, valid JSON object with two keys: "story" and "words".
        - The "story" should be a title like "## Spelling Bee! 🐝".
        - The "words" should be an array of exactly 5 age-appropriate spelling words.`;
    } else if (moduleType === 'emoji-riddles') {
        prompt = `Create an emoji riddles module for a child (age ${age}).
        ${baseJsonStructure}
        - The "story" should be a title like "## Emoji Riddles! 🤔".
        - The "questions" should be 5-7 riddles made of emojis. The answer should be a common object or animal. Example: "I am yellow, I grow on trees, and monkeys love me. 🍌", with the question "What am I?".`;
    }
    return prompt;
}