// IELTS Writing Test Application
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
        this.bindEvents();
        this.showScreen('login');
    }

    bindEvents() {
        // Login screen
        document.getElementById('loginBtn').addEventListener('click', () => this.handleLogin());
        
        // Main menu
        document.querySelectorAll('.start-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const setCard = e.target.closest('.set-card');
                const setId = setCard.dataset.set;
                this.showAccessCode(setId);
            });
        });

        // Access code screen
        document.getElementById('submitCode').addEventListener('click', () => this.checkAccessCode());
        document.getElementById('backToMenu').addEventListener('click', () => this.showScreen('menu'));
        document.getElementById('accessCode').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkAccessCode();
        });

        // Test screen
        document.getElementById('startTestBtn').addEventListener('click', () => this.startTest());
        document.getElementById('submitBtn').addEventListener('click', () => this.submitTest());
        document.getElementById('backToMenuTest').addEventListener('click', () => this.goBackToMenu());

        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const task = e.target.dataset.task;
                this.showTask(task);
            });
        });

        // Word count
        document.getElementById('task1Answer').addEventListener('input', () => this.updateWordCount(1));
        document.getElementById('task2Answer').addEventListener('input', () => this.updateWordCount(2));

        // Modals
        document.getElementById('closeWarning').addEventListener('click', () => this.hideModal('warningModal'));
        document.getElementById('closeMessage').addEventListener('click', () => this.hideModal('messageModal'));

        // Anti-cheating
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        window.addEventListener('blur', () => this.handleVisibilityChange());
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
        
        document.getElementById('userName').textContent = name + ' ' + surname;
        document.getElementById('displayName').textContent = name + ' ' + surname;
        
        this.showScreen('menu');
    }

    showAccessCode(setId) {
        if (setId === '1') {
            document.getElementById('setName').textContent = 'Set 1 - Film Production & Family History';
            this.showScreen('code');
            document.getElementById('accessCode').focus();
        }
    }

    checkAccessCode() {
        const code = document.getElementById('accessCode').value.trim();
        const errorElement = document.getElementById('codeError');
        
        if (code === 'versage_100') {
            errorElement.textContent = '';
            document.getElementById('displaySet').textContent = '1';
            this.showScreen('test');
            this.resetTest();
        } else {
            errorElement.textContent = 'Wrong code! Try: versage_100';
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

    showTask(taskNumber) {
        // Hide all tasks
        document.querySelectorAll('.task-content').forEach(task => {
            task.classList.remove('active');
        });
        
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected task
        document.getElementById('task' + taskNumber + 'Content').classList.add('active');
        document.querySelector(`[data-task="${taskNumber}"]`).classList.add('active');
    }

    startTest() {
        this.isTestStarted = true;
        this.warningShown = false;
        
        // Enable writing
        document.getElementById('task1Answer').disabled = false;
        document.getElementById('task2Answer').disabled = false;
        document.getElementById('submitBtn').disabled = false;
        
        // Update start button
        document.getElementById('startTestBtn').disabled = true;
        document.getElementById('startTestBtn').textContent = 'Test Running';
        
        // Start timer
        this.timer = 0;
        this.updateTimer();
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimer();
        }, 1000);
        
        this.showMessage('Test Started', 'You can now write your answers. Timer is running!');
    }

    updateTimer() {
        const hours = Math.floor(this.timer / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((this.timer % 3600) / 60).toString().padStart(2, '0');
        const seconds = (this.timer % 60).toString().padStart(2, '0');
        document.getElementById('timer').textContent = `${hours}:${minutes}:${seconds}`;
    }

    updateWordCount(taskNumber) {
        const textarea = document.getElementById('task' + taskNumber + 'Answer');
        const wordCount = document.getElementById('task' + taskNumber + 'Words');
        const text = textarea.value.trim();
        const words = text === '' ? 0 : text.split(/\s+/).filter(word => word.length > 0).length;
        wordCount.textContent = words;
    }

    handleVisibilityChange() {
        if (this.isTestStarted && (document.hidden || !document.hasFocus())) {
            if (!this.warningShown) {
                this.warningShown = true;
                this.showModal('warningModal');
            } else {
                this.resetTest();
                this.showMessage('Test Reset', 'You left the page again. Test has been reset.');
            }
        }
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    resetTest() {
        // Clear answers
        document.getElementById('task1Answer').value = '';
        document.getElementById('task2Answer').value = '';
        document.getElementById('task1Words').textContent = '0';
        document.getElementById('task2Words').textContent = '0';
        
        // Stop timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Reset state
        this.isTestStarted = false;
        this.warningShown = false;
        this.timer = 0;
        this.updateTimer();
        
        // Reset controls
        document.getElementById('task1Answer').disabled = true;
        document.getElementById('task2Answer').disabled = true;
        document.getElementById('submitBtn').disabled = true;
        document.getElementById('startTestBtn').disabled = false;
        document.getElementById('startTestBtn').textContent = 'Start Test';
        
        // Show task 1
        this.showTask(1);
    }

    goBackToMenu() {
        if (this.isTestStarted && (document.getElementById('task1Answer').value.trim() || document.getElementById('task2Answer').value.trim())) {
            if (confirm('Going back will lose your current answers. Continue?')) {
                this.resetTest();
                this.showScreen('menu');
            }
        } else {
            this.resetTest();
            this.showScreen('menu');
        }
    }

    async submitTest() {
        const task1 = document.getElementById('task1Answer').value.trim();
        const task2 = document.getElementById('task2Answer').value.trim();

        if (!task1 && !task2) {
            this.showMessage('Error', 'Please write answers for at least one task.');
            return;
        }

        try {
            document.getElementById('submitBtn').disabled = true;
            document.getElementById('submitBtn').textContent = 'Submitting...';

            const submission = {
                studentName: this.studentName,
                studentSurname: this.studentSurname,
                timerValue: document.getElementById('timer').textContent,
                submittedAt: new Date().toISOString(),
                task1Question: "The charts below show the number of films produced by five countries in three years.",
                task1Answer: task1,
                task2Question: "It is becoming increasingly popular to try to find out the history of one's own family. Why might people want to do this? Is it a positive or negative development?",
                task2Answer: task2
            };

            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submission)
            });

            const result = await response.json();

            if (result.success) {
                this.showMessage('Success', 'Your test has been submitted!', () => {
                    this.resetTest();
                    this.showScreen('menu');
                });
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showMessage('Error', 'Submission failed: ' + error.message);
            document.getElementById('submitBtn').disabled = false;
            document.getElementById('submitBtn').textContent = 'Submit Test';
        }
    }

    showMessage(title, text, callback) {
        document.getElementById('messageTitle').textContent = title;
        document.getElementById('messageText').textContent = text;
        this.showModal('messageModal');
        
        const closeBtn = document.getElementById('closeMessage');
        const closeHandler = () => {
            this.hideModal('messageModal');
            closeBtn.removeEventListener('click', closeHandler);
            if (callback) callback();
        };
        
        closeBtn.addEventListener('click', closeHandler);
    }
}

// Start the app when page loads
window.addEventListener('DOMContentLoaded', () => {
    new IELTSApp();
});

// Also make sure Enter key works in login
document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('studentName');
    const surnameInput = document.getElementById('studentSurname');
    
    if (nameInput && surnameInput) {
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                surnameInput.focus();
            }
        });
        
        surnameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('loginBtn').click();
            }
        });
    }
});
