# Bodhi 🌱

Bodhi is a modern, kid-friendly web app designed to help children learn reading, math, and logic through interactive, AI-powered modules. The app adapts content to the child's age, making learning fun, engaging, and personalized, while keeping all parental controls in a single, secure area.

## Features

- **Simplified Kid's View:** A clean, simple welcome screen where kids select their profile to begin.
- **Centralized Parent Settings:** All administrative tasks are consolidated into a single settings page, accessible via a floating gear icon (⚙️).
- **Robust Profile Management:** From the settings page, parents can easily **Create**, **Edit**, and **Delete** kid profiles.
- **Consistent Parental Gate:** A single, simple math question protects all sensitive actions (accessing settings, editing/deleting profiles, exiting a session).
- **Age-Appropriate Modules:** Reading, Math, and a new **Coding/Logic** module are generated based on specific age ranges (1-3, 4-6, 7-9, 10-12).
- **AI-Powered Content:** Uses the Gemini API (BYOK) to generate stories, math problems, and logic puzzles.
- **Interactive Quizzes:** Multiple-choice questions are presented as clean, readable cards with instant feedback and scoring.
- **Modern, Tablet-Friendly UI:** A bright, playful design with emojis and a fully responsive layout.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/simkeyur/Bodhi.git
    ```
2.  **Open `index.html` in your browser.**
3.  **Set your Gemini API key:**
    -   Click the floating gear icon (⚙️) at the bottom right.
    -   Answer the simple math question to unlock the settings.
    -   Enter your API key and click "Save". You can get a free key from [Google AI Studio](https://aistudio.google.com/app/apikey).
4.  **Create a profile** for your child within the settings page.
5.  **Return to the main screen** and let your child select their profile to start learning!

## Technologies Used

-   Plain HTML, CSS, JavaScript (ES6 Modules)
-   [Showdown.js](https://github.com/showdownjs/showdown) for Markdown rendering
-   Gemini API (BYOK - Bring Your Own Key)

## Contributing

Pull requests and suggestions are welcome! Please open an issue or submit a PR.

## License

MIT

---

Made with ❤️ for curious kids and their families.
