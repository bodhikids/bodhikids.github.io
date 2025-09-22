// This file will contain the logic for interacting with the Gemini API.

// --- Safe Local Storage Wrappers ---
// Safari's private browsing mode blocks localStorage. These functions prevent crashes.
function safeLocalStorageSet(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (e) {
        console.warn("localStorage is not available. Changes will not be saved.", e);
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

const API_KEY_STORAGE_KEY = 'gemini_api_key';

export function getApiKey() {
    return safeLocalStorageGet(API_KEY_STORAGE_KEY);
}

export function setApiKey(apiKey) {
    safeLocalStorageSet(API_KEY_STORAGE_KEY, apiKey);
}

export async function generateContent(prompt) {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error('API key not found. Please set your API key.');
        return 'API key not found. Please set your API key.';
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    "response_mime_type": "application/json",
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            const errorMessage = errorData?.error?.message || `HTTP error! status: ${response.status}`;
            return `Error generating content: ${errorMessage}`;
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error('Unexpected API response format:', data);
            return 'Could not parse content from API response.';
        }

    } catch (error) {
        console.error('Fetch Error:', error);
        return `An error occurred while trying to generate content: ${error.message}`;
    }
}

export async function generateStory(profile, module, existingStory = '') {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error('API key not found. Please set your API key.');
        return 'API key not found. Please set your API key.';
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateStory?key=${apiKey}`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                profile: profile,
                module: module,
                existingStory: existingStory,
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            const errorMessage = errorData?.error?.message || `HTTP error! status: ${response.status}`;
            return `Error generating story: ${errorMessage}`;
        }

        const data = await response.json();
        
        if (data.story) {
            return data.story;
        } else {
            console.error('Unexpected API response format:', data);
            return 'Could not parse story from API response.';
        }

    } catch (error) {
        console.error('Fetch Error:', error);
        return `An error occurred while trying to generate story: ${error.message}`;
    }
}

export async function generateQuestions(profile, module, story) {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error('API key not found. Please set your API key.');
        return 'API key not found. Please set your API key.';
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateQuestions?key=${apiKey}`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                profile: profile,
                module: module,
                story: story,
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            const errorMessage = errorData?.error?.message || `HTTP error! status: ${response.status}`;
            return `Error generating questions: ${errorMessage}`;
        }

        const data = await response.json();
        
        if (data.questions) {
            return data.questions;
        } else {
            console.error('Unexpected API response format:', data);
            return 'Could not parse questions from API response.';
        }

    } catch (error) {
        console.error('Fetch Error:', error);
        return `An error occurred while trying to generate questions: ${error.message}`;
    }
}

export async function generateAnswerExplanations(profile, module, story, questions, answers) {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error('API key not found. Please set your API key.');
        return 'API key not found. Please set your API key.';
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateAnswerExplanations?key=${apiKey}`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                profile: profile,
                module: module,
                story: story,
                questions: questions,
                answers: answers,
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            const errorMessage = errorData?.error?.message || `HTTP error! status: ${response.status}`;
            return `Error generating answer explanations: ${errorMessage}`;
        }

        const data = await response.json();
        
        if (data.explanations) {
            return data.explanations;
        } else {
            console.error('Unexpected API response format:', data);
            return 'Could not parse answer explanations from API response.';
        }

    } catch (error) {
        console.error('Fetch Error:', error);
        return `An error occurred while trying to generate answer explanations: ${error.message}`;
    }
}

export async function generateMathProblem(profile) {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error('API key not found. Please set your API key.');
        return 'API key not found. Please set your API key.';
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateMathProblem?key=${apiKey}`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                profile: profile,
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            const errorMessage = errorData?.error?.message || `HTTP error! status: ${response.status}`;
            return `Error generating math problem: ${errorMessage}`;
        }

        const data = await response.json();
        
        if (data.problem) {
            return data.problem;
        } else {
            console.error('Unexpected API response format:', data);
            return 'Could not parse math problem from API response.';
        }

    } catch (error) {
        console.error('Fetch Error:', error);
        return `An error occurred while trying to generate math problem: ${error.message}`;
    }
}

export async function generateLogicPuzzle(profile) {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error('API key not found. Please set your API key.');
        return 'API key not found. Please set your API key.';
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateLogicPuzzle?key=${apiKey}`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                profile: profile,
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            const errorMessage = errorData?.error?.message || `HTTP error! status: ${response.status}`;
            return `Error generating logic puzzle: ${errorMessage}`;
        }

        const data = await response.json();
        
        if (data.puzzle) {
            return data.puzzle;
        } else {
            console.error('Unexpected API response format:', data);
            return 'Could not parse logic puzzle from API response.';
        }

    } catch (error) {
        console.error('Fetch Error:', error);
        return `An error occurred while trying to generate logic puzzle: ${error.message}`;
    }
}
