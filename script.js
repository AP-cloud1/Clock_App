// Load configuration
fetch('config.json')
    .then(response => response.json())
    .then(config => {
        // Apply saved settings
        document.getElementById('current-time').style.color = config.clockColor;
        document.getElementById('current-time').style.background = config.clockBackground;
        document.getElementById('current-time').style.fontSize = `${config.fontSize}px`;
        
        // Update input values
        document.getElementById('clockColor').value = config.clockColor;
        document.getElementById('clockBackground').value = config.clockBackground;
        document.getElementById('fontSize').value = config.fontSize;
        
        // Apply theme
        if (config.theme === 'light') {
            document.body.style.background = 'linear-gradient(135deg, #f5f7fa, #c3cfe2)';
        }
        
        // Apply fullscreen if configured
        if (config.startFullscreen) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Error attempting to enable fullscreen:', err.message);
            });
        }
    })
    .catch(err => console.log('Error loading config:', err));

// Tab Switching
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
    });
});

// Clock functionality
function updateClock() {
    const now = new Date();
    const timeDisplay = document.getElementById('current-time');
    const dateDisplay = document.getElementById('current-date');
    
    timeDisplay.textContent = now.toLocaleTimeString('en-US', { hour12: false });
    dateDisplay.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

setInterval(updateClock, 1000);
updateClock();

// Clock Customization Toggle
document.querySelector('.customize-toggle').addEventListener('click', () => {
    const customizeSection = document.querySelector('.customize-section');
    customizeSection.classList.toggle('hidden');
    
    // Update button text
    const button = document.querySelector('.customize-toggle');
    if (customizeSection.classList.contains('hidden')) {
        button.innerHTML = '<i class="fas fa-paint-brush"></i> Customize Clock';
    } else {
        button.innerHTML = '<i class="fas fa-times"></i> Close Customization';
    }
});

// Clock Customization
document.getElementById('clockColor').addEventListener('input', (e) => {
    document.getElementById('current-time').style.color = e.target.value;
});

document.getElementById('clockBackground').addEventListener('input', (e) => {
    document.getElementById('current-time').style.background = e.target.value;
    // Adjust text shadow for better visibility
    const color = e.target.value;
    const isDark = isColorDark(color);
    document.getElementById('current-time').style.textShadow = isDark 
        ? '0 0 10px rgba(255, 255, 255, 0.5)'
        : '0 0 10px rgba(0, 0, 0, 0.5)';
});

// Helper function to determine if a color is dark
function isColorDark(color) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
}

document.getElementById('fontSize').addEventListener('input', (e) => {
    document.getElementById('current-time').style.fontSize = `${e.target.value}px`;
});

// Alarm functionality
const alarms = new Set();
const alarmSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');

document.getElementById('setAlarm').addEventListener('click', () => {
    const alarmTime = document.getElementById('alarmTime').value;
    if (!alarmTime) return;

    alarms.add(alarmTime);
    const alarmDiv = document.createElement('div');
    alarmDiv.className = 'alarm-item';
    alarmDiv.innerHTML = `
        <span>${alarmTime}</span>
        <button onclick="removeAlarm('${alarmTime}')">Delete</button>
    `;
    document.getElementById('activeAlarms').appendChild(alarmDiv);
});

function checkAlarms() {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    alarms.forEach(alarm => {
        if (alarm === currentTime) {
            alarmSound.play();
            alert('Alarm!');
        }
    });
}

function removeAlarm(time) {
    alarms.delete(time);
    document.getElementById('activeAlarms').innerHTML = '';
    alarms.forEach(alarm => {
        const alarmDiv = document.createElement('div');
        alarmDiv.className = 'alarm-item';
        alarmDiv.innerHTML = `
            <span>${alarm}</span>
            <button onclick="removeAlarm('${alarm}')">Delete</button>
        `;
        document.getElementById('activeAlarms').appendChild(alarmDiv);
    });
}

setInterval(checkAlarms, 1000);

// Stopwatch functionality
let stopwatchInterval;
let stopwatchTime = 0;
let isStopwatchRunning = false;

function updateStopwatch() {
    const hours = Math.floor(stopwatchTime / 3600);
    const minutes = Math.floor((stopwatchTime % 3600) / 60);
    const seconds = stopwatchTime % 60;
    document.getElementById('stopwatch-display').textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

document.getElementById('startStopwatch').addEventListener('click', () => {
    if (!isStopwatchRunning) {
        isStopwatchRunning = true;
        stopwatchInterval = setInterval(() => {
            stopwatchTime++;
            updateStopwatch();
        }, 1000);
    }
});

document.getElementById('pauseStopwatch').addEventListener('click', () => {
    clearInterval(stopwatchInterval);
    isStopwatchRunning = false;
});

document.getElementById('resetStopwatch').addEventListener('click', () => {
    clearInterval(stopwatchInterval);
    isStopwatchRunning = false;
    stopwatchTime = 0;
    updateStopwatch();
    document.getElementById('laps').innerHTML = '';
});

// Timer functionality
let timerInterval;
let timerTime = 0;
let isTimerRunning = false;

function updateTimer() {
    if (timerTime <= 0) {
        clearInterval(timerInterval);
        isTimerRunning = false;
        alarmSound.play();
        alert('Timer Complete!');
        return;
    }

    const hours = Math.floor(timerTime / 3600);
    const minutes = Math.floor((timerTime % 3600) / 60);
    const seconds = timerTime % 60;
    document.getElementById('timer-display').textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

document.getElementById('startTimer').addEventListener('click', () => {
    if (!isTimerRunning) {
        const hours = parseInt(document.getElementById('hours').value) || 0;
        const minutes = parseInt(document.getElementById('minutes').value) || 0;
        const seconds = parseInt(document.getElementById('seconds').value) || 0;
        
        timerTime = hours * 3600 + minutes * 60 + seconds;
        if (timerTime <= 0) return;

        isTimerRunning = true;
        timerInterval = setInterval(() => {
            timerTime--;
            updateTimer();
        }, 1000);
    }
});

document.getElementById('pauseTimer').addEventListener('click', () => {
    clearInterval(timerInterval);
    isTimerRunning = false;
});

document.getElementById('resetTimer').addEventListener('click', () => {
    clearInterval(timerInterval);
    isTimerRunning = false;
    timerTime = 0;
    document.getElementById('hours').value = '';
    document.getElementById('minutes').value = '';
    document.getElementById('seconds').value = '';
    updateTimer();
});

// Study Session functionality
let totalTimeInterval;
let studyTimeInterval;
let totalTime = 0;
let studyTime = 0;
let isStudySessionActive = false;
let isStudyPaused = false;

function updateStudyTimes() {
    const totalHours = Math.floor(totalTime / 3600);
    const totalMinutes = Math.floor((totalTime % 3600) / 60);
    const totalSeconds = totalTime % 60;
    
    const studyHours = Math.floor(studyTime / 3600);
    const studyMinutes = Math.floor((studyTime % 3600) / 60);
    const studySeconds = studyTime % 60;

    document.getElementById('total-time').textContent = 
        `${String(totalHours).padStart(2, '0')}:${String(totalMinutes).padStart(2, '0')}:${String(totalSeconds).padStart(2, '0')}`;
    document.getElementById('study-time').textContent = 
        `${String(studyHours).padStart(2, '0')}:${String(studyMinutes).padStart(2, '0')}:${String(studySeconds).padStart(2, '0')}`;
}

document.getElementById('startStudy').addEventListener('click', () => {
    if (!isStudySessionActive) {
        isStudySessionActive = true;
        isStudyPaused = false;
        totalTime = 0;
        studyTime = 0;
        
        totalTimeInterval = setInterval(() => {
            totalTime++;
            updateStudyTimes();
        }, 1000);

        studyTimeInterval = setInterval(() => {
            studyTime++;
            updateStudyTimes();
        }, 1000);

        document.getElementById('study-summary').textContent = 'Study session in progress...';
    }
});

document.getElementById('pauseStudy').addEventListener('click', () => {
    if (isStudySessionActive && !isStudyPaused) {
        clearInterval(studyTimeInterval);
        isStudyPaused = true;
        document.getElementById('study-summary').textContent = 'Break time - Study timer paused';
    }
});

document.getElementById('resumeStudy').addEventListener('click', () => {
    if (isStudySessionActive && isStudyPaused) {
        studyTimeInterval = setInterval(() => {
            studyTime++;
            updateStudyTimes();
        }, 1000);
        isStudyPaused = false;
        document.getElementById('study-summary').textContent = 'Study session resumed';
    }
});

document.getElementById('endStudy').addEventListener('click', () => {
    if (isStudySessionActive) {
        clearInterval(totalTimeInterval);
        clearInterval(studyTimeInterval);
        isStudySessionActive = false;
        isStudyPaused = false;

        const studyHours = Math.floor(studyTime / 3600);
        const studyMinutes = Math.floor((studyTime % 3600) / 60);
        const studySeconds = studyTime % 60;

        const totalHours = Math.floor(totalTime / 3600);
        const totalMinutes = Math.floor((totalTime % 3600) / 60);
        const totalSeconds = totalTime % 60;

        document.getElementById('study-summary').innerHTML = `
            <h3>Session Summary</h3>
            <p>Total Time: ${totalHours}h ${totalMinutes}m ${totalSeconds}s</p>
            <p>Actual Study Time: ${studyHours}h ${studyMinutes}m ${studySeconds}s</p>
            <p>Break Time: ${totalTime - studyTime} seconds</p>
        `;
    }
});
