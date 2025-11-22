// Modern IELTS Writing Pro System
class IELTSProApp {
    constructor() {
        this.currentScreen = 'intro';
        this.currentTask = 1;
        this.currentSet = null;
        this.timer = 0;
        this.timerInterval = null;
        this.isTestStarted = false;
        this.warningShown = false;
        this.studentName = '';
        this.studentSurname = '';
        this.typingMonitor = {
            lastKeyTime: 0,
            keyCount: 0,
            warningThreshold: 6, // characters per second
            checkInterval: null
        };
        
        this.writingSets = {
            set1: {
                name: "Set 1 - Film Production & Family History",
                code: "versage_100",
                task1: {
                    question: "The charts below show the number of films produced by five countries in three years.",
                    image: "/images/set1-task1.jpg"
                },
                task2: {
                    question: "It is becoming increasingly popular to try to find out the history of one's own family. Why might people want to do this? Is it a positive or negative development?"
                }
            },
            set2: {
                name: "Set 2 - Coming Soon",
                code: "coming_soon",
                task1: { question: "This set is under development." },
                task2: { question: "Check back later for new content." }
            },
            set3: {
                name: "Set 3 - Coming Soon", 
                code: "coming_soon",
                task1: { question: "This set is under development." },
                task2: { question: "Check back later for new content." }
            }
        };

        this.answers = {
            task1: '',
            task2: ''
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.showScreen('intro');
        this.startIntroAnimation();
    }

    startIntroAnimation() {
        setTimeout(() => {
            this.showScreen('login');
        }, 4000);
    }

    bindEvents() {
        // Login
        document.getElementById('loginBtn').addEventListener('click', () => this.handleLogin());
        
        // Enter key in login
        ['studentName', 'studentSurname'].forEach(id => {
            document.getElementById(id).addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleLogin();
            });
        });

        // Set selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('set-card') && !e.target.classList.contains('coming-soon')) {
                const setId = e.target.dataset.set || e.target.closest('.set-card').dataset.set;
                this.showAccessCode(setId);
            }
        });

        // Test controls
        document.getElementById('startTestBtn').addEventListener('click', () => this.startTest());
        document.getElementById('submitBtn').addEventListener('click', () => this.submitTest());
        document.getElementById('menuBtn').addEventListener('click', () => this.confirmExit());
        document.getElementById('newTestBtn').addEventListener('click', () => this.showScreen('menu'));
        document.getElementById('reviewMenuBtn').addEventListener('click', () => this.showScreen('menu'));

        // Task navigation
        document.querySelectorAll('.task-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const task = parseInt(e.currentTarget.dataset.task);
                this.switchTask(task);
            });
        });

        document.getElementById('prevTask').addEventListener('click', () => this.previousTask());
        document.getElementById('nextTask').addEventListener('click', () => this.nextTask());

        // Answer textarea events
        const answerText = document.getElementById('answerText');
        answerText.addEventListener('input', (e) => {
            this.updateWordCount();
            this.answers[`task${this.currentTask}`] = e.target.value;
            this.monitorTypingSpeed();
        });

        // Anti-copy-paste
        answerText.addEventListener('copy', (e) => e.preventDefault());
        answerText.addEventListener('paste', (e) => e.preventDefault());
        answerText.addEventListener('cut', (e) => e.preventDefault());
        answerText.addEventListener('contextmenu', (e) => e.preventDefault());

        // Modal controls
        document.getElementById('closeWarning').addEventListener('click', () => this.hideModal('warningModal'));
        document.getElementById('closeCheat').addEventListener('click', () => this.hideModal('cheatModal'));

        // Split panel resizing
        this.setupSplitPanel();

        // Anti-cheating visibility
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        window.addEventListener('blur', () => this.handleVisibilityChange());

        // Load sets
        this.loadSets();
    }

    loadSets() {
        const grid = document.getElementById('setsGrid');
        grid.innerHTML = '';

        Object.entries(this.writingSets).forEach(([key, set], index) => {
            const isComingSoon = set.code === 'coming_soon';
            const card = document.createElement('div');
            card.className = `set-card ${isComingSoon ? 'coming-soon' : ''}`;
            card.dataset.set = key;
            
            card.innerHTML = `
                <h3>${set.name}</h3>
                <p>${set.task1.question.substring(0, 80)}...</p>
                <p>${set.task2.question.substring(0, 80)}...</p>
                ${isComingSoon ? '<button class="btn btn-secondary" disabled>Coming Soon</button>' : ''}
            `;
            
            grid.appendChild(card);
        });
    }

    handleLogin() {
        const name = document.getElementById('studentName').value.trim();
        const surname = document.getElementById('studentSurname').value.trim();

        if (!name || !surname) {
            this.showMessage('Please enter both your name and surname.');
            return;
        }

        this.studentName = name;
        this.studentSurname = surname;
        
        document.getElementById('userName').textContent = `${name} ${surname}`;
        document.getElementById('displayName').textContent = `${name} ${surname}`;
        
        this.showScreen('menu');
    }

    showAccessCode(setId) {
        const set = this.writingSets[setId];
        if (set.code === 'coming_soon') {
            this.showMessage('This test set is currently under development and will be available soon.');
            return;
        }

        this.currentSet = set;
        const code = prompt(`Enter access code for ${set.name}:`);
        
        if (code === set.code) {
            document.getElementById('displaySet').textContent = setId.replace('set', 'Set ');
            this.showScreen('test');
            this.loadTaskContent(1);
        } else if (code) {
            alert('Invalid access code. Please try again.');
        }
    }

    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(`${screenName}Screen`).classList.add('active');
        this.currentScreen = screenName;
    }

    loadTaskContent(taskNumber) {
        const task = this.currentSet[`task${taskNumber}`];
        const content = document.getElementById('questionContent');
        
        content.innerHTML = `
            <h4>Writing Task ${taskNumber}</h4>
            <p>${task.question}</p>
            ${task.image ? `<img src="${task.image}" alt="Task ${taskNumber} Chart" class="question-image" onerror="this.style.display='none'">` : ''}
        `;

        // Load saved answer
        document.getElementById('answerText').value = this.answers[`task${taskNumber}`] || '';
        this.updateWordCount();
        
        // Update progress
        this.updateProgress(taskNumber);
    }

    switchTask(taskNumber) {
        this.currentTask = taskNumber;
        document.querySelectorAll('.task-tab').forEach(tab => {
            tab.classList.toggle('active', parseInt(tab.dataset.task) === taskNumber);
        });
        this.loadTaskContent(taskNumber);
        this.updateNavigation();
    }

    previousTask() {
        if (this.currentTask > 1) {
            this.switchTask(this.currentTask - 1);
        }
    }

    nextTask() {
        if (this.currentTask < 2) {
            this.switchTask(this.currentTask + 1);
        }
    }

    updateNavigation() {
        document.getElementById('prevTask').disabled = this.currentTask === 1;
        document.getElementById('nextTask').style.display = this.currentTask === 2 ? 'none' : 'block';
        document.getElementById('submitBtn').style.display = this.currentTask === 2 ? 'block' : 'none';
    }

    updateProgress(taskNumber) {
        const progress = (taskNumber / 2) * 100;
        document.querySelector('.progress-fill').style.width = `${progress}%`;
        document.querySelector('.current-task').textContent = `Task ${taskNumber}`;
    }

    startTest() {
        this.isTestStarted = true;
        this.warningShown = false;
        
        // Enable writing
        document.getElementById('answerText').disabled = false;
        document.getElementById('submitBtn').disabled = false;
        
        // Update UI
        document.getElementById('startTestBtn').disabled = true;
        document.getElementById('startTestBtn').textContent = 'Test Running';
        
        // Start timer
        this.startTimer();
        
        // Start typing monitor
        this.startTypingMonitor();
        
        this.showMessage('Test started! You can now begin writing.', 'success');
    }

    startTimer() {
        this.timer = 0;
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }

    updateTimerDisplay() {
        const hours = Math.floor(this.timer / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((this.timer % 3600) / 60).toString().padStart(2, '0');
        const seconds = (this.timer % 60).toString().padStart(2, '0');
        document.getElementById('timer').textContent = `${hours}:${minutes}:${seconds}`;
    }

    updateWordCount() {
        const text = document.getElementById('answerText').value;
        const words = text.trim() ? text.split(/\s+/).filter(word => word.length > 0).length : 0;
        document.getElementById('wordCount').textContent = words;
    }

    startTypingMonitor() {
        const textarea = document.getElementById('answerText');
        let lastKeyTime = Date.now();
        let keyCount = 0;

        textarea.addEventListener('keydown', () => {
            const now = Date.now();
            const timeDiff = (now - lastKeyTime) / 1000;
            
            if (timeDiff < 1) {
                keyCount++;
            } else {
                keyCount = 1;
            }
            
            lastKeyTime = now;

            // Check for excessive typing speed
            if (keyCount > this.typingMonitor.warningThreshold && timeDiff < 10) {
                this.showCheatingWarning();
                keyCount = 0;
            }
        });
    }

    showCheatingWarning() {
        document.getElementById('cheatModal').classList.add('active');
        document.getElementById('answerText').classList.add('typing-warning');
        
        setTimeout(() => {
            document.getElementById('answerText').classList.remove('typing-warning');
        }, 2000);
    }

    handleVisibilityChange() {
        if (this.isTestStarted && (document.hidden || !document.hasFocus())) {
            if (!this.warningShown) {
                this.warningShown = true;
                this.showModal('warningModal');
            } else {
                this.resetTest();
                this.showMessage('Test reset due to multiple page visibility changes.');
            }
        }
    }

    setupSplitPanel() {
        const container = document.getElementById('splitContainer');
        const divider = document.getElementById('splitDivider');
        let isResizing = false;

        divider.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.body.style.cursor = 'col-resize';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const containerRect = container.getBoundingClientRect();
            const x = e.clientX - containerRect.left;
            const percentage = (x / containerRect.width) * 100;

            // Limit between 20% and 80%
            const clampedPercentage = Math.max(20, Math.min(80, percentage));
            
            container.style.gridTemplateColumns = `${clampedPercentage}fr 8px 1fr`;
        });

        document.addEventListener('mouseup', () => {
            isResizing = false;
            document.body.style.cursor = '';
        });

        // Touch support for mobile
        divider.addEventListener('touchstart', (e) => {
            isResizing = true;
            e.preventDefault();
        });

        document.addEventListener('touchmove', (e) => {
            if (!isResizing) return;

            const containerRect = container.getBoundingClientRect();
            const x = e.touches[0].clientX - containerRect.left;
            const percentage = (x / containerRect.width) * 100;
            const clampedPercentage = Math.max(20, Math.min(80, percentage));
            
            container.style.gridTemplateColumns = `${clampedPercentage}fr 8px 1fr`;
        });

        document.addEventListener('touchend', () => {
            isResizing = false;
        });
    }

    async submitTest() {
        if (!this.answers.task1.trim() && !this.answers.task2.trim()) {
            this.showMessage('Please write answers for at least one task before submitting.');
            return;
        }

        try {
            this.setButtonLoading('submitBtn', true);

            const submission = {
                studentName: this.studentName,
                studentSurname: this.studentSurname,
                timerValue: document.getElementById('timer').textContent,
                submittedAt: new Date().toISOString(),
                task1Question: this.currentSet.task1.question,
                task1Answer: this.answers.task1,
                task2Question: this.currentSet.task2.question,
                task2Answer: this.answers.task2
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
                this.showReviewScreen(submission);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showMessage(`Submission failed: ${error.message}`);
        } finally {
            this.setButtonLoading('submitBtn', false);
        }
    }

    showReviewScreen(submission) {
        document.getElementById('finalTime').textContent = submission.timerValue;
        document.getElementById('submitTime').textContent = new Date().toLocaleString();
        document.getElementById('reviewAnswer1').textContent = submission.task1Answer || 'No answer provided';
        document.getElementById('reviewAnswer2').textContent = submission.task2Answer || 'No answer provided';
        
        this.showScreen('review');
        this.resetTest();
    }

    confirmExit() {
        if (this.isTestStarted && (this.answers.task1.trim() || this.answers.task2.trim())) {
            if (confirm('Are you sure you want to exit? Your current progress will be lost.')) {
                this.resetTest();
                this.showScreen('menu');
            }
        } else {
            this.resetTest();
            this.showScreen('menu');
        }
    }

    resetTest() {
        // Clear data
        this.answers = { task1: '', task2: '' };
        this.currentTask = 1;
        this.isTestStarted = false;
        this.warningShown = false;
        
        // Stop timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Reset UI
        document.getElementById('answerText').value = '';
        document.getElementById('answerText').disabled = true;
        document.getElementById('startTestBtn').disabled = false;
        document.getElementById('startTestBtn').textContent = 'Start Test';
        document.getElementById('submitBtn').disabled = true;
        document.getElementById('timer').textContent = '00:00:00';
        
        // Reset navigation
        this.switchTask(1);
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    showMessage(message, type = 'info') {
        alert(message); // Replace with custom modal if needed
    }

    setButtonLoading(buttonId, loading) {
        const btn = document.getElementById(buttonId);
        btn.classList.toggle('loading', loading);
        btn.disabled = loading;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new IELTSProApp();
});
