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
    displayError,
    showLoader,
    hideLoader,
    resetModuleView,
    updateScore
} from './ui.js';
import { saveProgress, renderProgressStats } from './progress.js';

document.addEventListener('DOMContentLoaded', () => {
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
    const profileCreation = document.getElementById('profile-creation');
    const addProfileBtn = document.getElementById('add-profile-btn');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const nameInput = document.getElementById('name');
    const ageInput = document.getElementById('age');
    const profileSelectionModal = document.getElementById('profile-selection-modal');
    const closeProfileSelectionBtn = document.getElementById('close-profile-selection-btn');
    const moduleSelection = document.getElementById('module-selection');
    const moduleContainer = document.getElementById('module-container');
    const moduleView = document.getElementById('module-view');
    const moduleTitle = document.getElementById('module-title');
    const submitAnswersBtn = document.getElementById('submit-answers-btn');
    const backBtn = document.getElementById('back-btn');
    const moduleBtns = document.querySelectorAll('.module-btn');
    const exitToProfileBtn = document.getElementById('exit-to-profile-btn');

    // Reusable Parental Gate elements
    const parentalGateModal = document.getElementById('parental-gate-modal');
    const closeParentalGateBtn = document.getElementById('close-parental-gate-btn');
    const parentalQuestion = document.getElementById('parental-question');
    const parentalAnswerInput = document.getElementById('parental-answer');
    const submitParentalAnswerBtn = document.getElementById('submit-parental-answer-btn');
    const parentalErrorMessage = document.getElementById('parental-error-message');

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
    let questionsData = [];
    let parentalCheckAnswer = 0;
    let onParentalCheckSuccess = null;
    let profileToEditIndex = -1;

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
        exitToProfileBtn.classList.remove('hidden'); // Show the exit button
        updateModuleVisibility();
    }

    async function selectModule(moduleType) {
        currentModule = moduleType;
        moduleSelection.classList.add('hidden');
        moduleContainer.classList.remove('hidden');
        backBtn.classList.remove('hidden');
        
        resetModuleView();
        showLoader();

        const prompt = getPrompt(currentProfile.age, moduleType);
        const result = await generateContent(prompt);
        
        hideLoader();

        try {
            const cleanedResult = result.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsedResult = JSON.parse(cleanedResult);

            displayModuleContent(moduleTitle.textContent, parsedResult.story, markdownConverter);

            if (moduleType === 'spelling') {
                questionsData = parsedResult.words.map(word => ({ word }));
                displaySpellingModule(questionsData);
            } else {
                questionsData = parsedResult.questions;
                displayQuestions(questionsData);
            }
        } catch (error) {
            console.error("Failed to parse JSON from API:", error);
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

        // Save progress after calculating the score
        if (currentProfile) {
            saveProgress(currentProfile.name, currentModule, score, questionsData.length);
        }
    }

    // --- Parental Gate Logic ---
    function openParentalGate(onSuccessCallback) {
        const num1 = Math.floor(Math.random() * 10) + 5;
        const num2 = Math.floor(Math.random() * 10) + 5;
        parentalCheckAnswer = num1 + num2;
        parentalQuestion.textContent = `What is ${num1} + ${num2}?`;
        parentalAnswerInput.value = '';
        parentalErrorMessage.classList.add('hidden'); // Hide error on open
        onParentalCheckSuccess = onSuccessCallback;
        parentalGateModal.classList.remove('hidden');
    }

    submitParentalAnswerBtn.addEventListener('click', () => {
        const userAnswer = parseInt(parentalAnswerInput.value, 10);
        if (userAnswer === parentalCheckAnswer) {
            parentalGateModal.classList.add('hidden');
            if (onParentalCheckSuccess) {
                onParentalCheckSuccess();
            }
        } else {
            parentalErrorMessage.classList.remove('hidden'); // Show error message
        }
    });

    closeParentalGateBtn.addEventListener('click', () => {
        parentalGateModal.classList.add('hidden');
    });

    // --- Profile Management ---
    function deleteProfile(profileIndex) {
        openParentalGate(() => {
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

    // --- Event Listeners ---

    selectProfileBtn.addEventListener('click', () => {
        renderProfilesForKids(profiles, selectProfile);
        profileSelectionModal.classList.remove('hidden');
    });

    closeProfileSelectionBtn.addEventListener('click', () => {
        profileSelectionModal.classList.add('hidden');
    });

    addProfileBtn.addEventListener('click', () => {
        profileCreation.classList.toggle('hidden');
    });

    saveProfileBtn.addEventListener('click', () => {
        const name = nameInput.value;
        const age = ageInput.value;
        if (name && age) {
            profiles.push({ name, age });
            safeLocalStorageSet('profiles', JSON.stringify(profiles));
            renderProfilesForSettings(profiles, editProfile, deleteProfile);
            nameInput.value = '';
            ageInput.value = '';
            profileCreation.classList.add('hidden');
        }
    });

    saveEditProfileBtn.addEventListener('click', () => {
        if (profileToEditIndex > -1) {
            profiles[profileToEditIndex].name = editNameInput.value;
            profiles[profileToEditIndex].age = editAgeInput.value;
            safeLocalStorageSet('profiles', JSON.stringify(profiles));
            editProfileModal.classList.add('hidden');
            renderProfilesForSettings(profiles, editProfile, deleteProfile);
            profileToEditIndex = -1;
        }
    });

    closeEditModalBtn.addEventListener('click', () => {
        editProfileModal.classList.add('hidden');
    });

    // --- Settings Listeners ---

    settingsFab.addEventListener('click', () => {
        openParentalGate(() => {
            apiKeyInput.value = getApiKey() || '';
            renderProfilesForSettings(profiles, editProfile, deleteProfile);
            updateProgressProfileSelect(); // Add this line
            settingsModal.classList.remove('hidden');
            checkSafari();
        });
    });

    exitToProfileBtn.addEventListener('click', () => {
        openParentalGate(() => {
            mainApp.classList.add('hidden');
            welcomeScreen.classList.remove('hidden');
            header.classList.remove('hidden');
            currentProfile = null;
            exitToProfileBtn.classList.add('hidden'); // Hide the exit button
        });
    });

    moduleBtns.forEach(btn => {
        btn.addEventListener('click', () => selectModule(btn.dataset.module));
    });

    backBtn.addEventListener('click', () => {
        moduleContainer.classList.add('hidden');
        moduleSelection.classList.remove('hidden');
        backBtn.classList.add('hidden');
    });

    function updateModuleVisibility() {
        const age = currentProfile ? parseInt(currentProfile.age, 10) : 0;
        const availableModules = getAvailableModules(age);
        
        moduleBtns.forEach(btn => {
            const moduleType = btn.dataset.module;
            btn.style.display = availableModules[moduleType] ? 'block' : 'none';
        });
    }

    submitAnswersBtn.addEventListener('click', checkAnswers);

    saveSettingsBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            setApiKey(apiKey);
            settingsModal.classList.add('hidden');
            apiKeyInput.classList.remove('input-error');
        } else {
            apiKeyInput.classList.add('input-error');
            apiKeyInput.placeholder = "API Key cannot be empty!";
        }
    });

    function checkSafari() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (isIOS) {
            safariHomescreenInfo.classList.remove('hidden');
        }
    }

    // --- Add to Home Screen Banner Logic ---
    function showAddToHomeScreenBanner() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        if (isIOS && !isStandalone) {
            addToHomeScreenBanner.classList.remove('hidden');
        }
    }

    closeBannerBtn.addEventListener('click', () => {
        addToHomeScreenBanner.classList.add('hidden');
    });

    // --- Progress Elements ---
    const progressProfileSelect = document.getElementById('progress-profile-select');
    const progressStats = document.getElementById('progress-stats');

    function updateProgressProfileSelect() {
        progressProfileSelect.innerHTML = '<option value="">Select a profile</option>';
        profiles.forEach(profile => {
            const option = document.createElement('option');
            option.value = profile.name;
            option.textContent = profile.name;
            progressProfileSelect.appendChild(option);
        });
    }

    progressProfileSelect.addEventListener('change', (e) => {
        const selectedProfile = e.target.value;
        if (selectedProfile) {
            renderProgressStats(selectedProfile, progressStats);
        } else {
            progressStats.innerHTML = '';
        }
    });

    // --- Initial Page Load ---
    function initializeApp() {
        parentalGateModal.classList.add('hidden');
        editProfileModal.classList.add('hidden');

        if (!getApiKey()) {
            settingsFab.classList.add('pulse');
            setTimeout(() => {
                openParentalGate(() => {
                    settingsModal.classList.remove('hidden');
                    apiKeyInput.focus();
                });
            }, 1000);
        }
        showAddToHomeScreenBanner();
    }

    initializeApp();
});