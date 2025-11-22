// Simple IELTS Writing Test System
class IELTSApp {
    constructor() {
        this.currentScreen = 'login';
        this.timer = 0;
        this.timerInterval = null;
        this.isTestStarted = false;
        this.warningShown = false;
        this.studentName = '';
        this.studentSurname = '';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showScreen('login');
    }

    setupEventListeners() {
        // Login screen
        document.getElementById('startButton').addEventListener('click', () => this.handleLogin());
        
        // Main menu
        document.querySelectorAll('.set-item:not(.coming-soon) button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const setItem = e.target.closest('.set-item');
                this.showAccessCode(setItem.dataset.set);
            });
        });

        document.querySelectorAll('.set-item.coming-soon button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showMessage('Coming Soon', 'This test set is currently under development and will be available soon.');
            });
        });

        // Access code screen
        document.getElementById('submitCode').addEventListener('click', () => this.checkAccessCode());
        document.getElementById('backToMenu').addEventListener('click', () => this.showScreen('mainMenu'));
        document.getElementById('accessCode').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkAccessCode();
        });

        // Writing test screen
        document.getElementById('startTimer').addEventListener('click', () => this.startTest());
        document.getElementById('submitTest').addEventListener('click', () => this.submitTest());
        document.getElementById('backToMenuFromTest').addEventListener('click', () => this.confirmBackToMenu());

        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.showTask(e.target.dataset.task);
            });
        });

        // Word count tracking
        document.getElementById('task1Answer').addEventListener('input', () => this.updateWordCount('task1'));
        document.getElementById('task2Answer').addEventListener('input', () => this.updateWordCount('task2'));

        // Modal buttons
        document.getElementById('closeWarning').addEventListener('click', () => this.hideWarning());
        document.getElementById('closeMessage').addEventListener('click', () => this.hideMessage());

        // Anti-cheating detection
        document.addEventListener('visibilitychange', () => {
            if (this.isTestStarted && document.hidden) {
                this.handleVisibilityChange();
            }
        });

        window.addEventListener('blur', () => {
            if (this.isTestStarted) {
                this.handleVisibilityChange();
            }
        });
    }

    handleLogin() {
        const name = document.getElementById('studentName').value.trim();
        const surname = document.getElementById('studentSurname').value.trim();

        if (!name || !surname) {
            this.showMessage('Error', 'Please enter both your name and surname.');
            return;
        }

        this.studentName = name;
        this.studentSurname = surname;
        
        document.getElementById('userNameDisplay').textContent = name + ' ' + surname;
        document.getElementById('displayName').textContent = name + ' ' + surname;
        
        this.showScreen('mainMenu');
    }

    showAccessCode(setId) {
        if (setId === 'set1') {
            document.getElementById('setNameDisplay').textContent = 'Set 1 - Film Production & Family History';
            this.showScreen('accessCodeScreen');
            document.getElementById('accessCode').focus();
        }
    }

    checkAccessCode() {
        const code = document.getElementById('accessCode').value.trim();
        
        if (code === 'versage_100') {
            document.getElementById('displaySetName').textContent = 'Set 1 - Film Production';
            this.showScreen('writingScreen');
            this.resetTestState();
        } else {
            document.getElementById('codeError').textContent = 'Invalid access code. Please try again.';
            document.getElementById('accessCode').focus();
            document.getElementById('accessCode').select();
        }
    }

    showScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        document.getElementById(screenName + 'Screen').classList.add('active');
        this.currentScreen = screenName;
    }

    showTask(taskId) {
        // Hide all tasks
        document.querySelectorAll('.task-section').forEach(task => {
            task.classList.remove('active');
        });
        
        // Update navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected task
        document.getElementById(taskId).classList.add('active');
        document.querySelector(`[data-task="${taskId}"]`).classList.add('active');
    }

    startTest() {
        this.isTestStarted = true;
        this.warningShown = false;
        
        // Enable answer fields
        document.getElementById('task1Answer').disabled = false;
        document.getElementById('task2Answer').disabled = false;
        document.getElementById('submitTest').disabled = false;
        
        // Disable start button
        document.getElementById('startTimer').disabled = true;
        document.getElementById('startTimer').textContent = 'Test Running';
        
        // Start timer
        this.timer = 0;
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
        
        this.showMessage('Test Started', 'Your writing test has begun. Timer is running. Do not switch tabs or windows.');
    }

    updateTimerDisplay() {
        const hours = Math.floor(this.timer / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((this.timer % 3600) / 60).toString().padStart(2, '0');
        const seconds = (this.timer % 60).toString().padStart(2, '0');
        document.getElementById('timer').textContent = `${hours}:${minutes}:${seconds}`;
    }

    updateWordCount(task) {
        const textarea = document.getElementById(task + 'Answer');
        const wordCount = document.getElementById(task + 'Words');
        const text = textarea.value.trim();
        const words = text === '' ? 0 : text.split(/\s+/).filter(word => word.length > 0).length;
        wordCount.textContent = words;
    }

    handleVisibilityChange() {
        if (!this.warningShown) {
            // First warning
            this.warningShown = true;
            this.showWarning();
        } else {
            // Second violation - reset test
            this.resetTestDueToCheating();
        }
    }

    showWarning() {
        document.getElementById('warningModal').classList.add('active');
    }

    hideWarning() {
        document.getElementById('warningModal').classList.remove('active');
    }

    resetTestDueToCheating() {
        this.resetTestState();
        this.showMessage('Test Reset', 'Your test has been reset because you left the page multiple times.');
    }

    resetTestState() {
        // Clear answers
        document.getElementById('task1Answer').value = '';
        document.getElementById('task2Answer').value = '';
        document.getElementById('task1Words').textContent = '0';
        document.getElementById('task2Words').textContent = '0';
        
        // Reset timer
        this.timer = 0;
        this.updateTimerDisplay();
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Reset state
        this.isTestStarted = false;
        this.warningShown = false;
        
        // Reset buttons and fields
        document.getElementById('task1Answer').disabled = true;
        document.getElementById('task2Answer').disabled = true;
        document.getElementById('submitTest').disabled = true;
        document.getElementById('startTimer').disabled = false;
        document.getElementById('startTimer').textContent = 'Start Test';
        
        // Show task 1
        this.showTask('task1');
    }

    confirmBackToMenu() {
        if (this.isTestStarted && (document.getElementById('task1Answer').value.trim() || document.getElementById('task2Answer').value.trim())) {
            this.showMessage('Confirm Exit', 'If you go back to menu, your current answers and timer will be lost. Are you sure?', () => {
                this.goBackToMenu();
            });
        } else {
            this.goBackToMenu();
        }
    }

    goBackToMenu() {
        this.resetTestState();
        this.showScreen('mainMenu');
    }

    async submitTest() {
        const task1Answer = document.getElementById('task1Answer').value.trim();
        const task2Answer = document.getElementById('task2Answer').value.trim();

        if (!task1Answer && !task2Answer) {
            this.showMessage('Error', 'Please write answers for at least one task before submitting.');
            return;
        }

        if (!this.isTestStarted) {
            this.showMessage('Error', 'Please start the test before submitting.');
            return;
        }

        try {
            document.getElementById('submitTest').disabled = true;
            document.getElementById('submitTest').textContent = 'Submitting...';

            const submissionData = {
                studentName: this.studentName,
                studentSurname: this.studentSurname,
                timerValue: document.getElementById('timer').textContent,
                submittedAt: new Date().toISOString(),
                task1Question: "The charts below show the number of films produced by five countries in three years.",
                task1Answer: task1Answer,
                task2Question: "It is becoming increasingly popular to try to find out the history of one's own family. Why might people want to do this? Is it a positive or negative development?",
                task2Answer: task2Answer
            };

            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData)
            });

            const result = await response.json();

            if (result.success) {
                this.showMessage('Success', 'Your answers have been submitted successfully!', () => {
                    this.resetTestState();
                    this.showScreen('mainMenu');
                });
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showMessage('Error', 'Failed to submit: ' + error.message);
            document.getElementById('submitTest').disabled = false;
            document.getElementById('submitTest').textContent = 'Submit Test';
        }
    }

    showMessage(title, text, callback = null) {
        document.getElementById('messageTitle').textContent = title;
        document.getElementById('messageText').textContent = text;
        document.getElementById('messageModal').classList.add('active');
        
        const closeBtn = document.getElementById('closeMessage');
        const handler = () => {
            document.getElementById('messageModal').classList.remove('active');
            closeBtn.removeEventListener('click', handler);
            if (callback) callback();
        };
        
        closeBtn.addEventListener('click', handler);
    }

    hideMessage() {
        document.getElementById('messageModal').classList.remove('active');
    }
}

// Start the application when page loads
document.addEventListener('DOMContentLoaded', () => {
    new IELTSApp();
});
