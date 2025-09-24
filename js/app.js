import {
    getApiKey,
    setApiKey,
    generateContent,
    generateStory,
    generateQuestions,
    generateAnswerExplanations,
    generateMathProblem,
    generateLogicPuzzle
} from './gemini.js';
import { getPrompt, getAvailableModules } from './prompts.js';
import {
    renderProfilesForSettings,
    renderProfilesForKids,
    displayModuleContent,
    displayQuestions,
    displaySpellingModule,
    displayPhonicsModule,
    displayError,
    showLoader,
    hideLoader,
    resetModuleView,
    updateScore
} from './ui.js';
import { saveProgress, renderProgressStats } from './progress.js';

// --- Notyf Toast Notification System ---
// Initialize Notyf with custom configuration
let notyf;

function initializeNotyf() {
    if (typeof Notyf !== 'undefined') {
        notyf = new Notyf({
            duration: 4000,
            position: {
                x: 'right',
                y: 'top',
            },
            dismissible: true,
            ripple: true,
            types: [
                {
                    type: 'info',
                    background: '#2196F3',
                    icon: {
                        className: 'notyf__icon--info',
                        tagName: 'span',
                        text: 'ℹ️'
                    }
                },
                {
                    type: 'warning',
                    background: '#ff9800',
                    icon: {
                        className: 'notyf__icon--warning',
                        tagName: 'span',
                        text: '⚠️'
                    }
                }
            ]
        });
    } else {
        console.warn('Notyf library not loaded');
    }
}

// Toast functions using Notyf
function showSuccessToast(message, title = null) {
    if (!notyf) initializeNotyf();
    if (notyf) {
        const displayMessage = title ? `${title}: ${message}` : message;
        notyf.success(displayMessage);
    } else {
        console.log(`✅ ${title || 'Success'}: ${message}`);
    }
}

function showErrorToast(message, title = null) {
    if (!notyf) initializeNotyf();
    if (notyf) {
        const displayMessage = title ? `${title}: ${message}` : message;
        notyf.error(displayMessage);
    } else {
        console.log(`❌ ${title || 'Error'}: ${message}`);
    }
}

function showWarningToast(message, title = null) {
    if (!notyf) initializeNotyf();
    if (notyf) {
        const displayMessage = title ? `${title}: ${message}` : message;
        notyf.open({
            type: 'warning',
            message: displayMessage
        });
    } else {
        console.log(`⚠️ ${title || 'Warning'}: ${message}`);
    }
}

function showInfoToast(message, title = null) {
    if (!notyf) initializeNotyf();
    if (notyf) {
        const displayMessage = title ? `${title}: ${message}` : message;
        notyf.open({
            type: 'info',
            message: displayMessage
        });
    } else {
        console.log(`ℹ️ ${title || 'Info'}: ${message}`);
    }
}

// Confirmation dialog (still need custom implementation since Notyf doesn't have confirmation)
function showConfirmToast(message, onConfirm, onCancel = null) {
    if (confirm(message)) {
        if (onConfirm) onConfirm();
    } else {
        if (onCancel) onCancel();
    }
}

// Backward compatibility
function showToast(message, type = 'info', title = null) {
    switch(type) {
        case 'success':
            showSuccessToast(message, title);
            break;
        case 'error':
            showErrorToast(message, title);
            break;
        case 'warning':
            showWarningToast(message, title);
            break;
        case 'info':
        default:
            showInfoToast(message, title);
            break;
    }
}

// Make toast functions globally available
window.showToast = showToast;
window.showSuccessToast = showSuccessToast;
window.showErrorToast = showErrorToast;
window.showWarningToast = showWarningToast;
window.showInfoToast = showInfoToast;
window.showConfirmToast = showConfirmToast;

// Initialize Notyf when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeNotyf();
    // --- DOM Element Selections ---
    const header = document.querySelector('header');
    const welcomeScreen = document.getElementById('welcome-screen');
    const mainApp = document.getElementById('main-app');
    const selectProfileBtn = document.getElementById('select-profile-btn');
    const welcomeMessage = document.getElementById('welcome-message');
    const apiKeyInput = document.getElementById('api-key');
    const settingsFab = document.getElementById('settings-fab');
    const settingsModal = document.getElementById('settings-modal');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const resetAppBtn = document.getElementById('reset-app-btn');
    const toggleResetBtn = document.getElementById('toggle-reset-btn');
    const resetOptions = document.getElementById('reset-options');
    const profileCreation = document.getElementById('profile-creation');
    const addProfileBtn = document.getElementById('add-profile-btn');
    const nameInput = document.getElementById('name');
    const ageInput = document.getElementById('age');
    const profileSelectionModal = document.getElementById('profile-selection-modal');
    const closeProfileSelectionBtn = document.getElementById('close-profile-selection-btn');
    const moduleSelection = document.getElementById('module-selection');
    const themeSelection = document.getElementById('theme-selection');
    const themeSelectionTitle = document.getElementById('theme-selection-title');
    const themeButtonsContainer = document.getElementById('theme-buttons');
    const difficultySlider = document.getElementById('difficulty');
    const difficultyLabel = document.getElementById('difficulty-label');
    const moduleContainer = document.getElementById('module-container');
    const moduleView = document.getElementById('module-view');
    const moduleTitle = document.getElementById('module-title');
    const submitAnswersBtn = document.getElementById('submit-answers-btn');
    const backBtn = document.getElementById('back-btn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const moduleBtns = document.querySelectorAll('.module-btn');
    const exitToProfileBtn = document.getElementById('exit-to-profile-btn');

    // Reusable Parental Gate elements
    const parentalGateModal = document.getElementById('parental-gate-modal');
    const closeParentalGateBtn = document.getElementById('close-parental-gate-btn');
    const parentalQuestion = document.getElementById('parental-question');
    const parentalAnswerInput = document.getElementById('parental-answer');
    const submitParentalAnswerBtn = document.getElementById('submit-parental-answer-btn');
    const parentalErrorMessage = document.getElementById('parental-error-message');

    // PIN Entry Modal elements
    const pinEntryModal = document.getElementById('pin-entry-modal');
    const closePinEntryBtn = document.getElementById('close-pin-entry-btn');
    const pinDigits = document.querySelectorAll('#pin-entry-modal .pin-digit');
    const togglePinVisibilityBtn = document.getElementById('toggle-pin-entry-visibility');
    const submitPinBtn = document.getElementById('submit-pin-btn');
    const forgotPinBtn = document.getElementById('forgot-pin-btn');
    const pinErrorMessage = document.getElementById('pin-error-message');

    // PIN Recovery Modal elements
    const pinRecoveryModal = document.getElementById('pin-recovery-modal');
    const closePinRecoveryBtn = document.getElementById('close-pin-recovery-btn');
    const recoveryQuestionsContainer = document.getElementById('recovery-questions-container');
    const submitRecoveryBtn = document.getElementById('submit-recovery-btn');
    const backToPinBtn = document.getElementById('back-to-pin-btn');
    const recoveryErrorMessage = document.getElementById('recovery-error-message');

    // Add to Home Screen Banner elements
    const addToHomeScreenBanner = document.getElementById('add-to-home-screen-banner');
    const closeBannerBtn = document.getElementById('close-banner-btn');

    // Edit Profile Modal elements
    const editProfileModal = document.getElementById('edit-profile-modal');
    const closeEditModalBtn = document.getElementById('close-edit-modal-btn');
    const editNameInput = document.getElementById('edit-name');
    const editAgeInput = document.getElementById('edit-age');
    const saveEditProfileBtn = document.getElementById('save-edit-profile-btn');
    const safariHomescreenInfo = document.getElementById('safari-homescreen-info');

    // Add Profile Modal elements
    const addProfileModal = document.getElementById('add-profile-modal');
    const closeAddProfileBtn = document.getElementById('close-add-profile-btn');
    const addProfileNameInput = document.getElementById('add-profile-name');
    const addProfileAgeInput = document.getElementById('add-profile-age');
    const saveAddProfileBtn = document.getElementById('save-add-profile-btn');
    const cancelAddProfileBtn = document.getElementById('cancel-add-profile-btn');

    // Progress Tracking elements
    const progressProfileSelect = document.getElementById('progress-profile-select');
    const progressStatsContainer = document.getElementById('progress-stats');

    const markdownConverter = new showdown.Converter();

    // --- Safe Local Storage Wrappers ---
    function safeLocalStorageSet(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            console.warn("localStorage is not available. Profile changes will not be saved.", e);
            return false;
        }
    }

    function safeLocalStorageGet(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn("localStorage is not available.", e);
            return null;
        }
    }

    // --- Application State ---
    let profiles = JSON.parse(safeLocalStorageGet('profiles')) || [];
    let currentProfile = null;
    let currentModule = null;
    let currentTheme = null;
    let difficultyLevel = 1;
    let questionsData = [];
    let parentalCheckAnswer = 0;
    let onParentalCheckSuccess = null;
    let profileToEditIndex = -1;

    const THEMES = {
        'reading': [
            { id: 'fairy-tale', name: '🏰 Fairy Tale' },
            { id: 'jungle-adventure', name: '🌴 Jungle Adventure' },
            { id: 'underwater-world', name: '🐠 Underwater World' },
            { id: 'superhero-stories', name: '🦸 Superhero Stories' },
            { id: 'mystery-club', name: '🔍 Mystery Club' }
        ],
        'math': [
            { id: 'bakery-math', name: '🧁 Bakery Math' },
            { id: 'space-mission', name: '🚀 Space Mission' },
            { id: 'toy-store', name: '🧸 Toy Store' },
            { id: 'construction-zone', name: '🏗️ Construction Zone' },
            { id: 'grocery-shopping', name: '🛒 Grocery Shopping' }
        ],
        'logic': [
            { id: 'detective-case', name: '🕵️ Detective Case' },
            { id: 'treasure-hunt', name: '🗺️ Treasure Hunt' },
            { id: 'animal-kingdom', name: '🦁 Animal Kingdom' },
            { id: 'escape-room', name: '🚪 Escape Room' },
            { id: 'build-a-city', name: '🏙️ Build a City' }
        ],
        'rhyming': [
            { id: 'silly-songs', name: '🎶 Silly Songs' },
            { id: 'poetry-corner', name: '✍️ Poetry Corner' },
            { id: 'rap-battle', name: '🎤 Rap Battle' },
            { id: 'animal-parade', name: '🐘 Animal Parade' },
            { id: 'funny-poems', name: '🤪 Funny Poems' }
        ],
        'spelling': [
            { id: 'ancient-egypt', name: '📜 Ancient Egypt' },
            { id: 'dinosaur-dig', name: '🦴 Dinosaur Dig' },
            { id: 'magic-spells', name: '🪄 Magic Spells' },
            { id: 'pirate-treasure', name: '🏴‍☠️ Pirate Treasure' },
            { id: 'outer-space', name: '🪐 Outer Space' }
        ],
        'emoji-riddles': [
            { id: 'movie-titles', name: '🎬 Movie Titles' },
            { id: 'food-puzzles', name: '🍔 Food Puzzles' },
            { id: 'animal-fun', name: '🐘 Animal Fun' },
            { id: 'famous-places', name: '🏛️ Famous Places' },
            { id: 'common-phrases', name: '🗣️ Common Phrases' }
        ],
        'coding': [
            { id: 'build-a-robot', name: '🤖 Build a Robot' },
            { id: 'video-game-design', name: '🎮 Video Game Design' },
            { id: 'website-creator', name: '🌐 Website Creator' },
            { id: 'animation-studio', name: '🎬 Animation Studio' },
            { id: 'create-an-app', name: '📱 Create an App' }
        ],
        'ai': [
            { id: 'friendly-robots', name: '🤖 Friendly Robots' },
            { id: 'smart-city', name: '🏙️ Smart City' },
            { id: 'ai-artist', name: '🎨 AI Artist' },
            { id: 'self-driving-cars', name: '🚗 Self-Driving Cars' },
            { id: 'virtual-assistant', name: '🗣️ Virtual Assistant' }
        ],
        'science': [
            { id: 'volcano-expedition', name: '🌋 Volcano Expedition' },
            { id: 'space-exploration', name: '🌌 Space Exploration' },
            { id: 'deep-sea-discovery', name: '🌊 Deep Sea Discovery' },
            { id: 'weather-station', name: '🌦️ Weather Station' },
            { id: 'human-body', name: '🧠 Human Body' }
        ],
        'phonics': [
            { id: 'abc', name: '🔤 ABC Sounds' },
            { id: 'words', name: '🧩 Make Words' },
            { id: 'digraphs', name: '🦸 Super Sounds' },
            { id: 'vowel-teams', name: 'ae Vowel Teams' },
            { id: 'blends', name: 'sl Blends' }
        ]
    };

    const CATEGORIES = {
        school: ['reading', 'math', 'logic', 'science'],
        word: ['rhyming', 'spelling', 'phonics', 'emoji-riddles'],
        tech: ['coding', 'ai']
    };

    // --- Core Logic ---

    function selectProfile(profile) {
        currentProfile = profile;
        header.classList.add('hidden');
        welcomeScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        moduleSelection.classList.remove('hidden');
        moduleContainer.classList.add('hidden');
        welcomeMessage.textContent = `Welcome, ${profile.name}!`;
        profileSelectionModal.classList.add('hidden');
        
        // Button management: Show home button (protected by math), hide settings
        exitToProfileBtn.classList.remove('hidden');
        settingsFab.classList.add('hidden');
        
        // Reset to the first tab and update module visibility
        tabBtns.forEach(b => b.classList.remove('active'));
        tabBtns[0].classList.add('active');
        updateModuleVisibility('school');
    }

    function showThemeSelection(moduleType) {
        const themes = THEMES[moduleType] || THEMES['default'];
        themeSelectionTitle.textContent = `Choose a ${moduleType.charAt(0).toUpperCase() + moduleType.slice(1)} Theme!`;
        themeButtonsContainer.innerHTML = '';

        themes.forEach(theme => {
            const button = document.createElement('button');
            button.className = 'module-btn theme-btn';
            button.dataset.module = moduleType;
            button.dataset.theme = theme.id;
            button.innerHTML = theme.name;
            button.addEventListener('click', () => selectModule(moduleType, theme.id));
            themeButtonsContainer.appendChild(button);
        });

        moduleSelection.classList.add('hidden');
        themeSelection.classList.remove('hidden');
        backBtn.classList.remove('hidden');
        
        // Hide both floating buttons in theme selection
        exitToProfileBtn.classList.add('hidden');
        settingsFab.classList.add('hidden');
    }

    async function selectModule(moduleType, theme = null) {
        currentModule = moduleType;
        currentTheme = theme;

        if (!theme) {
            showThemeSelection(moduleType);
            return;
        }

        themeSelection.classList.add('hidden');
        moduleSelection.classList.add('hidden');
        moduleContainer.classList.remove('hidden');
        backBtn.classList.remove('hidden');
        
        // Hide both floating buttons in actual modules
        settingsFab.classList.add('hidden');
        exitToProfileBtn.classList.add('hidden');
        
        resetModuleView();
        showLoader();

        // Set module title
        const moduleTitles = {
            'reading': '📚 Reading Adventure',
            'math': '🧮 Math Challenge',
            'logic': '🧠 Logic Puzzles',
            'rhyming': '🎤 Rhyme Time',
            'spelling': '🐝 Spelling Bee',
            'emoji-riddles': '🤔 Emoji Riddles',
            'coding': '💻 Code Breakers',
            'ai': '🤖 AI Explorers',
            'science': '🔬 Science Lab',
            'phonics': '🗣️ Phonics Fun'
        };
        moduleTitle.textContent = moduleTitles[moduleType] || moduleType.charAt(0).toUpperCase() + moduleType.slice(1);

        const prompt = getPrompt(currentProfile.age, moduleType, currentTheme, difficultyLevel);
        const result = await generateContent(prompt);
        
        hideLoader();

        // Check if the result is an error message before trying to parse
        if (result.includes('Error') || result.includes('error') || result.includes('API key not found')) {
            console.error("API returned error:", result);
            showErrorToast(result, 'API Error');
            displayError(result);
            return;
        }

        try {
            const cleanedResult = result.replace(/```json/g, '').replace(/```/g, '').trim();
            console.log("Attempting to parse:", cleanedResult.substring(0, 200) + "...");
            const parsedResult = JSON.parse(cleanedResult);

            // Validate the response structure
            if (!parsedResult) {
                throw new Error("Parsed result is null or undefined");
            }

            displayModuleContent(moduleTitle.textContent, parsedResult.story, markdownConverter);

            if (moduleType === 'spelling') {
                if (!parsedResult.words || !Array.isArray(parsedResult.words)) {
                    throw new Error("Invalid spelling response: missing or invalid 'words' array");
                }
                questionsData = parsedResult.words.map(word => ({ word }));
                displaySpellingModule(questionsData);
            } else if (moduleType === 'phonics') {
                if (!parsedResult.questions || !Array.isArray(parsedResult.questions)) {
                    throw new Error("Invalid phonics response: missing or invalid 'questions' array");
                }
                questionsData = parsedResult.questions;
                displayPhonicsModule(questionsData);
            } else {
                if (!parsedResult.questions || !Array.isArray(parsedResult.questions)) {
                    throw new Error("Invalid response: missing or invalid 'questions' array");
                }
                questionsData = parsedResult.questions;
                displayQuestions(questionsData);
            }
        } catch (error) {
            console.error("Failed to parse JSON from API:", error);
            console.error("Raw API result:", result);
            showErrorToast("Could not load the module content. Please check your API key and try again.", 'Content Generation Failed');
            displayError("Oops! Something went wrong. Could not load the module content. Please try again.");
        }
    }

    function checkAnswers() {
        let score = 0;
        const questionCards = document.querySelectorAll('.question-card');

        if (currentModule === 'spelling') {
            questionCards.forEach(card => {
                const questionIndex = parseInt(card.dataset.questionIndex, 10);
                const input = card.querySelector('.spelling-input');
                const correctAnswer = questionsData[questionIndex].word;

                if (input.value.toLowerCase() === correctAnswer.toLowerCase()) {
                    score++;
                    card.classList.add('correct');
                } else {
                    card.classList.add('incorrect');
                }
                input.disabled = true;
            });
        } else {
            questionCards.forEach(card => {
                const questionIndex = parseInt(card.dataset.questionIndex, 10);
                const selectedOption = card.querySelector('.option.selected');
                
                if (selectedOption) {
                    const selectedAnswerIndex = parseInt(selectedOption.dataset.optionIndex, 10);
                    const correctAnswerIndex = questionsData[questionIndex].answer;

                    if (selectedAnswerIndex === correctAnswerIndex) {
                        score++;
                        card.classList.add('correct');
                    } else {
                        card.classList.add('incorrect');
                    }
                }
                card.querySelectorAll('.option').forEach(opt => opt.style.pointerEvents = 'none');
            });
        }

        updateScore(score, questionsData.length);

        // Show score toast notification
        const percentage = Math.round((score / questionsData.length) * 100);
        if (percentage === 100) {
            showSuccessToast(`Perfect score! You got all ${questionsData.length} questions right! 🎉`, 'Excellent Work!');
        } else if (percentage >= 80) {
            showSuccessToast(`Great job! You scored ${percentage}% (${score}/${questionsData.length})`, 'Well Done!');
        } else if (percentage >= 60) {
            showInfoToast(`Good effort! You scored ${percentage}% (${score}/${questionsData.length})`, 'Keep Practicing!');
        } else {
            showInfoToast(`You scored ${percentage}% (${score}/${questionsData.length}). Keep trying!`, 'Practice Makes Perfect!');
        }

        // If score is 100%, trigger confetti
        if (score === questionsData.length) {
            window.confetti({
                particleCount: 150,
                spread: 180,
                origin: { y: 0.6 }
            });
        }

        // Save progress after calculating the score
        if (currentProfile) {
            saveProgress(currentProfile.name, currentModule, score, questionsData.length);
        }
    }

    // --- Parental Gate Logic ---
    function openParentalGate(onSuccessCallback) {
        // Always use math questions for home button (exit to profile)
        const num1 = Math.floor(Math.random() * 10) + 5;
        const num2 = Math.floor(Math.random() * 10) + 5;
        parentalCheckAnswer = num1 + num2;
        parentalQuestion.textContent = `What is ${num1} + ${num2}?`;
        parentalAnswerInput.value = '';
        parentalErrorMessage.classList.add('hidden'); // Hide error on open
        onParentalCheckSuccess = onSuccessCallback;
        parentalGateModal.classList.remove('hidden');
    }

    function openPinGate(onSuccessCallback) {
        // Use PIN for settings access
        const storedPin = localStorage.getItem('parentalPin');

        if (!storedPin) {
            // No PIN set up - this shouldn't happen as we force setup, but handle gracefully
            showErrorToast('PIN not set up. Please reset the app to continue.', 'Setup Required');
            window.location.href = 'force-reset.html';
            return;
        }

        openPinEntry(onSuccessCallback);
    }

    function openPinEntry(onSuccessCallback) {
        // Reset PIN inputs
        pinDigits.forEach(digit => {
            digit.value = '';
            digit.type = 'password';
        });
        pinErrorMessage.classList.add('hidden');
        togglePinVisibilityBtn.textContent = 'Show PIN';

        onParentalCheckSuccess = onSuccessCallback;
        pinEntryModal.classList.remove('hidden');

        // Focus first digit
        if (pinDigits.length > 0) {
            pinDigits[0].focus();
        }
    }

    // PIN Entry Modal Event Listeners
    pinDigits.forEach((digit, index) => {
        digit.addEventListener('input', (e) => {
            // Allow only numbers
            e.target.value = e.target.value.replace(/[^0-9]/g, '');

            // Auto-focus next input
            if (e.target.value && index < pinDigits.length - 1) {
                pinDigits[index + 1].focus();
            }

            // Auto-submit when all digits filled
            const allFilled = Array.from(pinDigits).every(d => d.value);
            if (allFilled) {
                setTimeout(() => validatePin(), 100);
            }
        });

        digit.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                pinDigits[index - 1].focus();
            }
        });

        digit.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);
            pastedData.split('').forEach((char, i) => {
                if (pinDigits[i]) pinDigits[i].value = char;
            });
            if (pastedData.length === 4) {
                setTimeout(() => validatePin(), 100);
            }
        });
    });

    togglePinVisibilityBtn.addEventListener('click', () => {
        const isVisible = pinDigits[0].type === 'text';
        pinDigits.forEach(digit => {
            digit.type = isVisible ? 'password' : 'text';
        });
        togglePinVisibilityBtn.textContent = isVisible ? 'Show PIN' : 'Hide PIN';
    });

    submitPinBtn.addEventListener('click', validatePin);

    forgotPinBtn.addEventListener('click', () => {
        pinEntryModal.classList.add('hidden');
        openPinRecovery(onParentalCheckSuccess);
    });

    closePinEntryBtn.addEventListener('click', () => {
        pinEntryModal.classList.add('hidden');
    });

    function validatePin() {
        const enteredPin = Array.from(pinDigits).map(d => d.value).join('');
        const storedPin = localStorage.getItem('parentalPin');

        if (enteredPin === storedPin) {
            pinEntryModal.classList.add('hidden');
            if (onParentalCheckSuccess) {
                onParentalCheckSuccess();
            }
        } else {
            pinErrorMessage.classList.remove('hidden');
            // Clear inputs and focus first
            pinDigits.forEach(digit => digit.value = '');
            pinDigits[0].focus();
        }
    }

    function openPinRecovery(onSuccessCallback) {
        const recoveryQuestions = JSON.parse(localStorage.getItem('recoveryQuestions') || '{}');

        if (!recoveryQuestions.a1 && !recoveryQuestions.a2 && !recoveryQuestions.a3) {
            // No recovery questions set up - show error
            showErrorToast('No recovery questions are set up. Please contact support to reset your PIN.', 'Recovery Unavailable');
            return;
        }

        // For reset/recovery, only ask one random question
        const questions = [
            { key: 'a1', text: 'What is your favorite color?' },
            { key: 'a2', text: 'What city were you born in?' },
            { key: 'a3', text: 'What is your favorite sports team?' }
        ];

        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

        recoveryQuestionsContainer.innerHTML = `
            <div class="recovery-question-item">
                <h4>${randomQuestion.text}</h4>
                <input type="text" class="recovery-answer-input" data-question="${randomQuestion.key}" placeholder="Your answer">
            </div>
        `;

        recoveryErrorMessage.classList.add('hidden');
        onParentalCheckSuccess = onSuccessCallback;
        pinRecoveryModal.classList.remove('hidden');

        // Focus the input
        setTimeout(() => {
            const input = recoveryQuestionsContainer.querySelector('.recovery-answer-input');
            if (input) input.focus();
        }, 100);
    }

    // PIN Recovery Modal Event Listeners
    submitRecoveryBtn.addEventListener('click', () => {
        const input = recoveryQuestionsContainer.querySelector('.recovery-answer-input');
        const questionKey = input.dataset.question;
        const answer = input.value.trim().toLowerCase();

        const storedAnswers = JSON.parse(localStorage.getItem('recoveryQuestions') || '{}');

        // Check if answer matches the stored answer for this question
        if (answer === storedAnswers[questionKey]) {
            pinRecoveryModal.classList.add('hidden');
            // Show PIN reset modal instead of redirecting to welcome page
            showPinResetModal();
        } else {
            recoveryErrorMessage.classList.remove('hidden');
        }
    });

    backToPinBtn.addEventListener('click', () => {
        pinRecoveryModal.classList.add('hidden');
        openPinEntry(onParentalCheckSuccess);
    });

    closePinRecoveryBtn.addEventListener('click', () => {
        pinRecoveryModal.classList.add('hidden');
    });

    // Parental Gate Modal Event Listeners
    submitParentalAnswerBtn.addEventListener('click', () => {
        const userAnswer = parseInt(parentalAnswerInput.value.trim(), 10);
        if (userAnswer === parentalCheckAnswer) {
            parentalGateModal.classList.add('hidden');
            if (onParentalCheckSuccess) {
                onParentalCheckSuccess();
            }
        } else {
            parentalErrorMessage.classList.remove('hidden');
        }
    });

    closeParentalGateBtn.addEventListener('click', () => {
        parentalGateModal.classList.add('hidden');
    });

    // --- Profile Management ---
    function deleteProfile(profileIndex) {
        openPinGate(() => {
            profiles.splice(profileIndex, 1);
            safeLocalStorageSet('profiles', JSON.stringify(profiles));
            renderProfilesForSettings(profiles, editProfile, deleteProfile);
        });
    }

    function editProfile(profileIndex) {
        profileToEditIndex = profileIndex;
        const profile = profiles[profileIndex];
        editNameInput.value = profile.name;
        editAgeInput.value = profile.age;
        editProfileModal.classList.remove('hidden');
    }

    // --- Progress Tracking Functions ---
    function populateProgressDropdown() {
        // Clear existing options except the default
        progressProfileSelect.innerHTML = '<option value="">Select a profile</option>';
        
        // Add profile options
        profiles.forEach((profile, index) => {
            const option = document.createElement('option');
            option.value = profile.name;
            option.textContent = profile.name;
            progressProfileSelect.appendChild(option);
        });
        
        // Initialize with default message
        progressStatsContainer.innerHTML = '<p>Select a profile to view learning progress.</p>';
    }

    // --- PIN Reset Modal Functions ---
    function showPinResetModal() {
        const pinResetModal = document.getElementById('pin-reset-modal');
        const pinDigits = document.querySelectorAll('.pin-digit-reset');
        const resetPinErrorMessage = document.getElementById('reset-pin-error-message');

        // Clear any previous error messages
        resetPinErrorMessage.classList.add('hidden');

        // Clear previous inputs
        pinDigits.forEach(digit => digit.value = '');
        document.getElementById('reset-recovery-color').value = '';
        document.getElementById('reset-recovery-city').value = '';
        document.getElementById('reset-recovery-team').value = '';

        // Set up PIN digit navigation
        setupPinDigitNavigation(pinDigits);

        // Hide settings button during PIN reset
        if (settingsFab) {
            settingsFab.classList.add('hidden');
        }

        // Show modal
        pinResetModal.classList.remove('hidden');

        // Focus first PIN digit
        pinDigits[0].focus();
    }

    function closePinResetModal() {
        const pinResetModal = document.getElementById('pin-reset-modal');
        pinResetModal.classList.add('hidden');
        
        // Show settings button again when modal is closed
        // Settings should be visible on welcome screen, hidden in main app
        if (settingsFab) {
            // If we're on welcome screen (mainApp is hidden), show settings
            // If we're in main app (mainApp is visible), keep settings hidden  
            if (mainApp.classList.contains('hidden')) {
                settingsFab.classList.remove('hidden');
            }
        }
    }

    function setupPinDigitNavigation(pinDigits) {
        pinDigits.forEach((digit, index) => {
            digit.addEventListener('input', (e) => {
                if (e.target.value && index < pinDigits.length - 1) {
                    pinDigits[index + 1].focus();
                }
            });

            digit.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    pinDigits[index - 1].focus();
                }
            });
        });
    }

    function validateAndSaveResetPin() {
        const pinDigits = document.querySelectorAll('.pin-digit-reset');
        const pin = Array.from(pinDigits).map(d => d.value).join('');

        if (pin.length !== 4) {
            showResetPinError('Please enter a 4-digit PIN');
            return false;
        }

        // Validate recovery questions
        const recoveryAnswers = {
            color: document.getElementById('reset-recovery-color').value.trim(),
            city: document.getElementById('reset-recovery-city').value.trim(),
            team: document.getElementById('reset-recovery-team').value.trim()
        };

        if (!recoveryAnswers.color || !recoveryAnswers.city || !recoveryAnswers.team) {
            showResetPinError('Please answer all recovery questions');
            return false;
        }

        // Save new PIN and recovery questions (don't touch other data)
        localStorage.setItem('parentalPin', pin);
        localStorage.setItem('recoveryQuestions', JSON.stringify({
            a1: recoveryAnswers.color.toLowerCase(),
            a2: recoveryAnswers.city.toLowerCase(),
            a3: recoveryAnswers.team.toLowerCase()
        }));

        return true;
    }

    function showResetPinError(message) {
        const errorElement = document.getElementById('reset-pin-error-message');
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }

    // PIN Reset Modal Event Listeners
    const pinResetModal = document.getElementById('pin-reset-modal');
    const saveResetPinBtn = document.getElementById('save-reset-pin-btn');
    const cancelPinResetBtn = document.getElementById('cancel-pin-reset-btn');
    const toggleResetPinVisibility = document.getElementById('toggle-reset-pin-visibility');

    saveResetPinBtn?.addEventListener('click', () => {
        if (validateAndSaveResetPin()) {
            closePinResetModal();
            showSuccessToast('Your PIN and recovery questions have been updated.', 'PIN Updated');
        }
    });

    cancelPinResetBtn?.addEventListener('click', () => {
        closePinResetModal();
    });

    toggleResetPinVisibility?.addEventListener('click', () => {
        const pinDigits = document.querySelectorAll('.pin-digit-reset');
        const isVisible = pinDigits[0].type === 'text';

        pinDigits.forEach(digit => {
            digit.type = isVisible ? 'password' : 'text';
        });

        toggleResetPinVisibility.textContent = isVisible ? 'Show PIN' : 'Hide PIN';
    });

    // Settings Modal Event Listeners
    saveSettingsBtn?.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            setApiKey(apiKey);
            settingsModal.classList.add('hidden');
            settingsFab.classList.remove('pulse');
            
            // Show settings button again when modal is closed (only if on welcome screen)
            if (!welcomeScreen.classList.contains('hidden')) {
                settingsFab.classList.remove('hidden');
            }
            
            showSuccessToast('Settings have been saved successfully!');
        } else {
            showErrorToast('Please enter a valid API key to continue.', 'Invalid API Key');
        }
    });

    // Main UI Event Listeners
    selectProfileBtn?.addEventListener('click', () => {
        profileSelectionModal.classList.remove('hidden');
        renderProfilesForKids(profiles, selectProfile);
    });

    settingsFab?.addEventListener('click', () => {
        openPinGate(() => {
            // Populate API key field
            const currentApiKey = getApiKey();
            if (currentApiKey) {
                apiKeyInput.value = currentApiKey;
            }
            
            // Render profiles in settings
            renderProfilesForSettings(profiles, editProfile, deleteProfile);
            
            // Populate progress profile dropdown
            populateProgressDropdown();
            
            // Hide settings button when settings modal is open
            settingsFab.classList.add('hidden');
            settingsModal.classList.remove('hidden');
        });
    });

    // Edit Profile Modal Event Listeners
    saveEditProfileBtn?.addEventListener('click', () => {
        const newName = editNameInput.value.trim();
        const newAge = parseInt(editAgeInput.value.trim(), 10);

        if (newName && newAge && newAge >= 3 && newAge <= 15) {
            profiles[profileToEditIndex] = { name: newName, age: newAge };
            safeLocalStorageSet('profiles', JSON.stringify(profiles));
            editProfileModal.classList.add('hidden');
            renderProfilesForSettings(profiles, editProfile, deleteProfile);
            showSuccessToast('Profile has been updated successfully!');
        } else {
            showErrorToast('Please enter a valid name and age (3-15 years).', 'Invalid Input');
        }
    });

    closeEditModalBtn?.addEventListener('click', () => {
        editProfileModal.classList.add('hidden');
    });

    // Close banner button event listener
    closeBannerBtn?.addEventListener('click', () => {
        addToHomeScreenBanner.classList.add('hidden');
    });

    closeProfileSelectionBtn?.addEventListener('click', () => {
        profileSelectionModal.classList.add('hidden');
    });

    // Tab event listeners for learning modules
    tabBtns.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.dataset.category;
            updateModuleVisibility(category);
        });
    });

    // Progress profile select event listener
    progressProfileSelect?.addEventListener('change', (e) => {
        const selectedProfile = e.target.value;
        if (selectedProfile) {
            renderProgressStats(selectedProfile, progressStatsContainer);
        } else {
            progressStatsContainer.innerHTML = '<p>Select a profile to view learning progress.</p>';
        }
    });

    // Back button event listener
    backBtn?.addEventListener('click', () => {
        if (moduleContainer.classList.contains('hidden') === false) {
            // If in module view, go back to theme selection
            moduleContainer.classList.add('hidden');
            themeSelection.classList.remove('hidden');
            backBtn.classList.remove('hidden');
            
            // Hide both floating buttons in theme selection
            exitToProfileBtn.classList.add('hidden');
            settingsFab.classList.add('hidden');
        } else if (themeSelection.classList.contains('hidden') === false) {
            // If in theme selection, go back to module selection
            themeSelection.classList.add('hidden');
            moduleSelection.classList.remove('hidden');
            backBtn.classList.add('hidden');
            
            // Show home button (protected by math), hide settings in module selection
            exitToProfileBtn.classList.remove('hidden');
            settingsFab.classList.add('hidden');
        }
    });

    // Submit answers button event listener
    submitAnswersBtn?.addEventListener('click', () => {
        checkAnswers();
    });

    // Exit to profile button event listener
    exitToProfileBtn?.addEventListener('click', () => {
        // Use math guard for home button (child-friendly protection)
        openParentalGate(() => {
            // Reset app state to profile selection
            mainApp.classList.add('hidden');
            header.classList.remove('hidden');
            welcomeScreen.classList.remove('hidden');
            moduleContainer.classList.add('hidden');
            themeSelection.classList.add('hidden');
            moduleSelection.classList.add('hidden');
            backBtn.classList.add('hidden');
            submitAnswersBtn.classList.add('hidden');
            currentProfile = null;
            
            // Show settings button (protected by PIN), hide home button on welcome screen
            settingsFab.classList.remove('hidden');
            exitToProfileBtn.classList.add('hidden');
        });
    });

    // Add profile button event listener - show modal
    addProfileBtn?.addEventListener('click', () => {
        addProfileModal.classList.remove('hidden');
        addProfileNameInput.focus();
    });

    // Add Profile Modal event listeners
    closeAddProfileBtn?.addEventListener('click', () => {
        addProfileModal.classList.add('hidden');
        addProfileNameInput.value = '';
        addProfileAgeInput.value = '';
    });

    cancelAddProfileBtn?.addEventListener('click', () => {
        addProfileModal.classList.add('hidden');
        addProfileNameInput.value = '';
        addProfileAgeInput.value = '';
    });

    saveAddProfileBtn?.addEventListener('click', () => {
        const name = addProfileNameInput.value.trim();
        const age = parseInt(addProfileAgeInput.value);
        
        if (name && age && age >= 3 && age <= 15) {
            const newProfile = { name: name, age: age };
            profiles.push(newProfile);
            safeLocalStorageSet('profiles', JSON.stringify(profiles));
            renderProfilesForSettings(profiles, editProfile, deleteProfile);
            populateProgressDropdown();
            showSuccessToast('New profile has been added successfully!');
            
            // Close modal and clear inputs
            addProfileModal.classList.add('hidden');
            addProfileNameInput.value = '';
            addProfileAgeInput.value = '';
        } else if (!name) {
            showErrorToast('Please enter a valid name.', 'Missing Name');
            addProfileNameInput.focus();
        } else if (!age || age < 3 || age > 15) {
            showErrorToast('Please enter a valid age (3-15 years).', 'Invalid Age');
            addProfileAgeInput.focus();
        }
    });

    // Close modal when clicking outside
    addProfileModal?.addEventListener('click', (e) => {
        if (e.target === addProfileModal) {
            addProfileModal.classList.add('hidden');
            addProfileNameInput.value = '';
            addProfileAgeInput.value = '';
        }
    });

    // Add Profile Modal - Enter key functionality
    addProfileNameInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addProfileAgeInput.focus();
        }
    });

    addProfileAgeInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveAddProfileBtn.click();
        }
    });

    // Toggle reset options visibility
    toggleResetBtn?.addEventListener('click', () => {
        const isHidden = resetOptions.classList.contains('hidden');
        
        if (isHidden) {
            resetOptions.classList.remove('hidden');
            toggleResetBtn.textContent = 'Hide Reset Options';
            toggleResetBtn.classList.add('expanded');
        } else {
            resetOptions.classList.add('hidden');
            toggleResetBtn.textContent = 'Show Reset Options';
            toggleResetBtn.classList.remove('expanded');
        }
    });

    // Reset app button event listener
    resetAppBtn?.addEventListener('click', () => {
        showConfirmToast(
            'Are you sure you want to reset everything? This will delete all profiles, progress, and settings.',
            () => {
                showConfirmToast(
                    'This action cannot be undone. Are you absolutely sure?',
                    () => {
                        // Clear all localStorage data
                        localStorage.clear();
                        // Reload the page to restart the app
                        window.location.reload();
                    }
                );
            }
        );
    });

    // --- Add to Home Screen Banner Functions ---
    function showAddToHomeScreenBanner() {
        // Check if user has already dismissed the banner
        if (localStorage.getItem('homescreenBannerDismissed') === 'true') {
            return;
        }

        // Check if it's iOS Safari
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isStandalone = window.navigator.standalone === true;

        // Show banner only for iOS Safari users who haven't added to home screen
        if (isIOS && isSafari && !isStandalone) {
            addToHomeScreenBanner.classList.remove('hidden');
        }
    }

    // --- Initial Page Load ---
    function initializeApp() {
        parentalGateModal.classList.add('hidden');
        editProfileModal.classList.add('hidden');

        // Initial button state: Show settings (protected by PIN), hide home button on welcome screen
        settingsFab.classList.remove('hidden');
        exitToProfileBtn.classList.add('hidden');

        if (!getApiKey()) {
            settingsFab.classList.add('pulse');
            setTimeout(() => {
                openParentalGate(() => {
                    // Populate API key field
                    const currentApiKey = getApiKey();
                    if (currentApiKey) {
                        apiKeyInput.value = currentApiKey;
                    }
                    
                    // Render profiles in settings
                    renderProfilesForSettings(profiles, editProfile, deleteProfile);
                    
                    // Populate progress profile dropdown
                    populateProgressDropdown();
                    
                    settingsModal.classList.remove('hidden');
                    apiKeyInput.focus();
                });
            }, 1000);
        }
        showAddToHomeScreenBanner();
    }

    // --- Module Visibility Function ---
    function updateModuleVisibility(category) {
        // Update tab active state
        tabBtns.forEach((tab, index) => {
            tab.classList.toggle('active', index === ['school', 'word', 'tech'].indexOf(category));
        });

        // Clear existing module buttons
        const moduleGrid = document.querySelector('.module-buttons');
        if (moduleGrid) {
            moduleGrid.innerHTML = '';
        }

        // Get modules for this category
        const categoryModules = CATEGORIES[category] || [];
        
        categoryModules.forEach(moduleType => {
            const moduleBtn = document.createElement('button');
            moduleBtn.className = 'module-btn';
            moduleBtn.dataset.module = moduleType;
            
            // Set module title and emoji
            const moduleInfo = {
                'reading': { emoji: '📚', title: 'Reading' },
                'math': { emoji: '🧮', title: 'Math' },
                'logic': { emoji: '🧠', title: 'Logic' },
                'rhyming': { emoji: '🎤', title: 'Rhyming' },
                'spelling': { emoji: '🐝', title: 'Spelling' },
                'phonics': { emoji: '🗣️', title: 'Phonics' },
                'emoji-riddles': { emoji: '🤔', title: 'Emoji Riddles' },
                'coding': { emoji: '💻', title: 'Coding' },
                'ai': { emoji: '🤖', title: 'AI' },
                'science': { emoji: '🔬', title: 'Science' }
            };
            
            const info = moduleInfo[moduleType] || { emoji: '❓', title: moduleType };
            moduleBtn.innerHTML = `${info.emoji}<br>${info.title}`;
            
            moduleBtn.addEventListener('click', () => showThemeSelection(moduleType));
            moduleGrid.appendChild(moduleBtn);
        });
    }

    initializeApp();
});