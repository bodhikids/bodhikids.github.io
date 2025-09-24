// Welcome page setup functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeWelcomeSetup();
});

function initializeWelcomeSetup() {
    // Prevent navigation away during setup
    window.history.pushState(null, null, window.location.href);
    window.onpopstate = function() {
        window.history.pushState(null, null, window.location.href);
    };

    // Check if setup is already complete
    if (localStorage.getItem('bodhiSetupComplete') === 'true') {
        // Redirect to main app
        window.location.href = 'index.html';
        return;
    }

    // Check if setup was in progress (user refreshed or navigated away)
    const setupInProgress = sessionStorage.getItem('setupInProgress');
    if (setupInProgress) {
        // Resume from where they left off
        const currentStep = sessionStorage.getItem('currentSetupStep') || 'welcome-step';
        showSetupStep(currentStep);
        updateProgress(getStepNumber(currentStep));
    } else {
        // Clear any existing data to ensure clean setup
        localStorage.clear();
        // Set setup in progress flag
        sessionStorage.setItem('setupInProgress', 'true');
    }

    setupWelcomeFlow();
    setupPinInputs();
    setupApiKeyToggle();
}

function setupWelcomeFlow() {
    const startSetupBtn = document.getElementById('start-setup-btn');
    const savePinBtn = document.getElementById('save-pin-btn');
    const saveApiKeyBtn = document.getElementById('save-api-key-btn');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const enterAppBtn = document.getElementById('enter-app-btn');

    // Navigation buttons
    const backToWelcomeBtn = document.getElementById('back-to-welcome-btn');
    const backToPinBtn = document.getElementById('back-to-pin-btn');
    const backToApiBtn = document.getElementById('back-to-api-btn');

    // Check if we should resume from a specific step
    const currentStep = sessionStorage.getItem('currentSetupStep') || 'welcome-step';
    if (currentStep !== 'welcome-step') {
        showSetupStep(currentStep);
        updateProgress(getStepNumber(currentStep));
    }

    startSetupBtn?.addEventListener('click', () => {
        sessionStorage.setItem('currentSetupStep', 'pin-setup-step');
        showSetupStep('pin-setup-step');
        updateProgress(2);
    });

    savePinBtn?.addEventListener('click', () => {
        if (validateAndSavePin()) {
            sessionStorage.setItem('currentSetupStep', 'api-setup-step');
            showSetupStep('api-setup-step');
            updateProgress(3);
        }
    });

    saveApiKeyBtn?.addEventListener('click', () => {
        if (validateAndSaveApiKey()) {
            sessionStorage.setItem('currentSetupStep', 'profile-setup-step');
            showSetupStep('profile-setup-step');
            updateProgress(4);
        }
    });

    saveProfileBtn?.addEventListener('click', () => {
        if (validateAndSaveProfile()) {
            sessionStorage.setItem('currentSetupStep', 'setup-complete-step');
            showSetupStep('setup-complete-step');
            updateProgress(5);
        }
    });

    enterAppBtn?.addEventListener('click', () => {
        completeSetup();
    });

    // Back navigation
    backToWelcomeBtn?.addEventListener('click', () => {
        sessionStorage.setItem('currentSetupStep', 'welcome-step');
        showSetupStep('welcome-step');
        updateProgress(1);
    });

    backToPinBtn?.addEventListener('click', () => {
        sessionStorage.setItem('currentSetupStep', 'pin-setup-step');
        showSetupStep('pin-setup-step');
        updateProgress(2);
    });

    backToApiBtn?.addEventListener('click', () => {
        sessionStorage.setItem('currentSetupStep', 'api-setup-step');
        showSetupStep('api-setup-step');
        updateProgress(3);
    });
}

function showSetupStep(stepId) {
    // Hide all steps
    document.querySelectorAll('.setup-step').forEach(step => {
        step.classList.remove('active');
    });

    // Show target step
    const targetStep = document.getElementById(stepId);
    if (targetStep) {
        targetStep.classList.add('active');
    }
}

function updateProgress(stepNumber) {
    // Update progress indicator
    document.querySelectorAll('.progress-step').forEach(step => {
        const stepNum = parseInt(step.dataset.step);
        if (stepNum <= stepNumber) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

function setupPinInputs() {
    const pinDigits = document.querySelectorAll('.pin-digit');
    if (!pinDigits.length) return;

    // Initialize all digits as password fields
    pinDigits.forEach(digit => {
        digit.type = 'password';
    });

    pinDigits.forEach((digit, index) => {
        // Handle input
        digit.addEventListener('input', (e) => {
            // Allow only numbers
            e.target.value = e.target.value.replace(/[^0-9]/g, '');

            // Auto-focus next input
            if (e.target.value && index < pinDigits.length - 1) {
                pinDigits[index + 1].focus();
            }
        });

        // Handle backspace
        digit.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                pinDigits[index - 1].focus();
            }
        });

        // Handle paste
        digit.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);
            pastedData.split('').forEach((char, i) => {
                if (pinDigits[i]) pinDigits[i].value = char;
            });
            if (pastedData.length === 4) {
                pinDigits[3].focus();
            }
        });
    });

    // Toggle PIN visibility
    const toggleBtn = document.getElementById('toggle-pin-visibility');
    toggleBtn?.addEventListener('click', () => {
        const isVisible = pinDigits[0].type === 'text';
        pinDigits.forEach(digit => {
            digit.type = isVisible ? 'password' : 'text';
        });
        toggleBtn.textContent = isVisible ? 'Show PIN' : 'Hide PIN';
    });
}

function setupApiKeyToggle() {
    const toggleBtn = document.getElementById('toggle-api-visibility');
    const apiKeyInput = document.getElementById('api-key-setup');

    toggleBtn?.addEventListener('click', () => {
        const isVisible = apiKeyInput.type === 'text';
        apiKeyInput.type = isVisible ? 'password' : 'text';
        toggleBtn.textContent = isVisible ? 'Show Key' : 'Hide Key';
    });
}

function validateAndSavePin() {
    const pinDigits = document.querySelectorAll('.pin-digit');
    const pin = Array.from(pinDigits).map(d => d.value).join('');

    if (pin.length !== 4) {
        showError('Please enter a 4-digit PIN');
        return false;
    }

    // Validate recovery questions
    const recoveryAnswers = {
        color: document.getElementById('recovery-color').value.trim(),
        city: document.getElementById('recovery-city').value.trim(),
        team: document.getElementById('recovery-team').value.trim()
    };

    if (!recoveryAnswers.color || !recoveryAnswers.city || !recoveryAnswers.team) {
        showError('Please answer all recovery questions');
        return false;
    }

    // Save PIN and recovery questions
    localStorage.setItem('parentalPin', pin);
    localStorage.setItem('recoveryQuestions', JSON.stringify({
        a1: recoveryAnswers.color.toLowerCase(),
        a2: recoveryAnswers.city.toLowerCase(),
        a3: recoveryAnswers.team.toLowerCase()
    }));

    return true;
}

function validateAndSaveApiKey() {
    const apiKey = document.getElementById('api-key-setup').value.trim();

    if (!apiKey) {
        showError('Please enter your Gemini API key');
        return false;
    }

    // Basic validation - should start with expected prefix
    if (!apiKey.startsWith('AIza')) {
        showError('Please enter a valid Gemini API key');
        return false;
    }

    localStorage.setItem('gemini_api_key', apiKey);
    return true;
}

function validateAndSaveProfile() {
    const name = document.getElementById('setup-name').value.trim();
    const age = parseInt(document.getElementById('setup-age').value);

    if (!name) {
        showError('Please enter your child\'s name');
        return false;
    }

    if (!age || age < 1 || age > 15) {
        showError('Please enter a valid age (1-15)');
        return false;
    }

    const profile = {
        id: Date.now().toString(),
        name: name,
        age: age,
        created: new Date().toISOString()
    };

    const profiles = [profile];
    localStorage.setItem('profiles', JSON.stringify(profiles));
    localStorage.setItem('currentProfile', profile.id);

    return true;
}

function completeSetup() {
    // Clear setup session data
    sessionStorage.removeItem('setupInProgress');
    sessionStorage.removeItem('currentSetupStep');

    // Mark setup as complete
    localStorage.setItem('bodhiSetupComplete', 'true');

    // Redirect to main app
    window.location.href = 'index.html';
}

function showError(message) {
    const errorElement = document.getElementById('setup-error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
        setTimeout(() => {
            errorElement.classList.add('hidden');
        }, 4000);
    }
}

function getStepNumber(stepId) {
    const stepMap = {
        'welcome-step': 1,
        'pin-setup-step': 2,
        'api-setup-step': 3,
        'profile-setup-step': 4,
        'setup-complete-step': 5
    };
    return stepMap[stepId] || 1;
}