// Progress tracking module
export function initializeProgress() {
    const progress = JSON.parse(localStorage.getItem('learning_progress')) || {};
    return progress;
}

export function saveProgress(profileName, moduleType, score, total) {
    let progress = initializeProgress();
    
    if (!progress[profileName]) {
        progress[profileName] = {};
    }
    
    if (!progress[profileName][moduleType]) {
        progress[profileName][moduleType] = {
            attempts: 0,
            totalScore: 0,
            bestScore: 0,
            lastAttempt: null
        };
    }

    const moduleProgress = progress[profileName][moduleType];
    moduleProgress.attempts += 1;
    moduleProgress.totalScore += (score / total) * 100;
    moduleProgress.bestScore = Math.max(moduleProgress.bestScore, (score / total) * 100);
    moduleProgress.lastAttempt = new Date().toISOString();

    localStorage.setItem('learning_progress', JSON.stringify(progress));
    return moduleProgress;
}

export function getProfileProgress(profileName) {
    const progress = initializeProgress();
    return progress[profileName] || {};
}

export function generateProgressStats(profileProgress) {
    const stats = {};
    
    for (const [moduleType, data] of Object.entries(profileProgress)) {
        stats[moduleType] = {
            averageScore: Math.round(data.totalScore / data.attempts),
            bestScore: Math.round(data.bestScore),
            attempts: data.attempts,
            lastAttempt: new Date(data.lastAttempt).toLocaleDateString()
        };
    }
    
    return stats;
}

export function renderProgressStats(profileName, container) {
    const progress = getProfileProgress(profileName);
    const stats = generateProgressStats(progress);
    
    let html = '';
    if (Object.keys(stats).length === 0) {
        html = '<p>No learning activity recorded yet.</p>';
    } else {
        html = '<div class="progress-grid">';
        for (const [moduleType, data] of Object.entries(stats)) {
            html += `
                <div class="progress-card">
                    <h4>${moduleType.charAt(0).toUpperCase() + moduleType.slice(1)}</h4>
                    <p>Average Score: ${data.averageScore}%</p>
                    <p>Best Score: ${data.bestScore}%</p>
                    <p>Total Attempts: ${data.attempts}</p>
                    <p>Last Attempt: ${data.lastAttempt}</p>
                </div>
            `;
        }
        html += '</div>';
    }
    
    container.innerHTML = html;
}