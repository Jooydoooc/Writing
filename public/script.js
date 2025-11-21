/**
 * IELTS Writing System with Multiple Sets and Secret Codes
 * 
 * WRITING_SETS Configuration:
 * - Each set requires a unique ID (e.g., "set1")
 * - Each set has: name, code, task1QuestionText, task1ImageUrl (optional), task2QuestionText, task2ImageUrl (optional)
 * - To add new sets, simply add new entries to the WRITING_SETS object below
 * - Images should be placed in public/images/ folder and referenced by URL
 */

const WRITING_SETS = {
    set1: {
        name: "Set 1 – Education Trends",
        code: "EDU2024",
        task1QuestionText: "The charts below show the percentage of students choosing different university subjects in the UK between 1990 and 2010.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        task1ImageUrl: null,
        task2QuestionText: "Some people believe that students should be required to take physical education classes throughout their entire school career. Others think that it is more important to focus on academic subjects.\n\nDiscuss both views and give your own opinion.",
        task2ImageUrl: null
    },
    set2: {
        name: "Set 2 – Environmental Issues",
        code: "ENV2024",
        task1QuestionText: "The graph below shows the average carbon dioxide emissions per person in four different countries from 1960 to 2010.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        task1ImageUrl: null,
        task2QuestionText: "Some people think that the best way to reduce environmental problems is to increase the cost of fuel for cars and other vehicles.\n\nTo what extent do you agree or disagree with this statement?",
        task2ImageUrl: null
    },
    set3: {
        name: "Set 3 – Technology Impact",
        code: "TECH2024",
        task1QuestionText: "The diagram below shows how solar panels can be used to provide electricity for domestic use.\n\nWrite a report for a university lecturer describing the information shown below.",
        task1ImageUrl: null,
        task2QuestionText: "With the development of technology, children are now living in a world that is completely different from what it was 50 years ago.\n\nWhat problems can this cause for society and the family?",
        task2ImageUrl: null
    },
    set4: {
        name: "Set 4 – Global Tourism",
        code: "TOUR2024",
        task1QuestionText: "The table below gives information about the number of visitors to three different museums in London before and after they introduced free admission in 2001.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
        task1ImageUrl: null,
        task2QuestionText: "International tourism has become a huge industry in the world. Some people think that the problems caused by international tourism outweigh the benefits.\n\nTo what extent do you agree or disagree?",
        task2ImageUrl: null
    }
};

class IELTSTest {
    constructor() {
        this.timer = 0;
        this.timerInterval = null;
        this.isTestStarted = false;
        this.warningGiven = false;
        this.currentScreen = 'task1';
        this.currentSetId = null;
        this.currentSet = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.setupVisibilityChangeHandler();
        this.renderMainMenu();
    }

    initializeElements() {
        // Screens
        this.mainMenu = document.getElementById('mainMenu');
        this.writingInterface = document.getElementById('writingInterface');
        this.setsContainer = document.getElementById('setsContainer');

        // Student info and timer
        this.studentName = document.getElementById('studentName');
        this.studentSurname = document.getElementById('studentSurname');
        this.currentSetInfo = document.getElementById('currentSetInfo');
        this.timerDisplay = document.getElementById('timerDisplay');
        this.startTestBtn = document.getElementById('startTestBtn');
        this.backToMenuBtn = document.getElementById('backToMenuBtn');

        // Navigation
        this.task1Btn = document.getElementById('task1Btn');
        this.task2Btn = document.getElementById('task2Btn');
        this.task1Screen = document.getElementById('task1Screen');
        this.task2Screen = document.getElementById('task2Screen');

        // Task 1 elements
        this.task1ImageContainer = document.getElementById('task1ImageContainer');
        this.task1QuestionText = document.getElementById('task1QuestionText');
        this.task1Answer = document.getElementById('task1Answer');
        this.task1WordCount = document.getElementById('task1WordCount');

        // Task 2 elements
        this.task2ImageContainer = document.getElementById('task2ImageContainer');
        this.task2QuestionText = document.getElementById('task2QuestionText');
        this.task2Answer = document.getElementById('task2Answer');
        this.task2WordCount = document.getElementById('task2WordCount');
        this.submitTest = document.getElementById('submitTest');

        // Modals
        this.accessCodeModal = document.getElementById('accessCodeModal');
        this.modalSetTitle = document.getElementById('modalSetTitle');
        this.accessCodeInput = document.getElementById('accessCodeInput');
        this.accessCodeError = document.getElementById('accessCodeError');
        this.confirmCodeBtn = document.getElementById('confirmCodeBtn');
        this.cancelCodeBtn = document.getElementById('cancelCodeBtn');

        this.warningModal = document.getElementById('warningModal');
        this.messageModal = document.getElementById('messageModal');
        this.modalOkBtn = document.getElementById('modalOkBtn');
        this.messageOkBtn = document.getElementById('messageOkBtn');
        this.messageTitle = document.getElementById('messageTitle');
        this.messageText = document.getElementById('messageText');

        this.confirmModal = document.getElementById('confirmModal');
        this.confirmText = document.getElementById('confirmText');
        this.confirmYesBtn = document.getElementById('confirmYesBtn');
        this.confirmNoBtn = document.getElementById('confirmNoBtn');
    }

    attachEventListeners() {
        // Navigation
        this.task1Btn.addEventListener('click', () => this.showScreen('task1'));
        this.task2Btn.addEventListener('click', () => this.showScreen('task2'));
        this.backToMenuBtn.addEventListener('click', () => this.showBackToMenuConfirmation());

        // Test control
        this.startTestBtn.addEventListener('click', () => this.startTest());

        // Word count tracking
        this.task1Answer.addEventListener('input', () => this.updateWordCount('task1'));
        this.task2Answer.addEventListener('input', () => this.updateWordCount('task2'));

        // Submission
        this.submitTest.addEventListener('click', () => this.submitAnswers());

        // Modal buttons
        this.confirmCodeBtn.addEventListener('click', () => this.checkAccessCode());
        this.cancelCodeBtn.addEventListener('click', () => this.hideAccessCodeModal());
        this.accessCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkAccessCode();
        });

        this.modalOkBtn.addEventListener('click', () => this.hideWarningModal());
        this.messageOkBtn.addEventListener('click', () => this.hideMessageModal());

        this.confirmYesBtn.addEventListener('click', () => this.confirmBackToMenu());
        this.confirmNoBtn.addEventListener('click', () => this.hideConfirmModal());
    }

    setupVisibilityChangeHandler() {
        // Handle tab/window visibility changes for anti-cheating
        document.addEventListener('visibilitychange', () => {
            if (this.isTestStarted && document.hidden) {
                this.handleVisibilityChange();
            }
        });

        // Also handle window blur (switching to other applications)
        window.addEventListener('blur', () => {
            if (this.isTestStarted) {
                this.handleVisibilityChange();
            }
        });
    }

    /**
     * Renders the main menu with all available sets from WRITING_SETS
     */
    renderMainMenu() {
        this.setsContainer.innerHTML = '';
        
        Object.entries(WRITING_SETS).forEach(([setId, setData]) => {
            const setCard = document.createElement('div');
            setCard.className = 'set-card';
            setCard.innerHTML = `
                <h3>${setData.name}</h3>
                <div class="set-id">ID: ${setId}</div>
                <p>${setData.task2QuestionText.substring(0, 100)}...</p>
                <button class="start-set-btn" data-set="${setId}">Start This Set</button>
            `;
            this.setsContainer.appendChild(setCard);
        });

        // Add event listeners to start buttons
        document.querySelectorAll('.start-set-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const setId = e.target.getAttribute('data-set');
                this.showAccessCodeModal(setId);
            });
        });
    }

    showAccessCodeModal(setId) {
        this.currentSetId = setId;
        this.currentSet = WRITING_SETS[setId];
        this.modalSetTitle.textContent = `Access Code for ${this.currentSet.name}`;
        this.accessCodeInput.value = '';
        this.accessCodeError.textContent = '';
        this.accessCodeModal.style.display = 'block';
        this.accessCodeInput.focus();
    }

    hideAccessCodeModal() {
        this.accessCodeModal.style.display = 'none';
        this.currentSetId = null;
        this.currentSet = null;
    }

    checkAccessCode() {
        const enteredCode = this.accessCodeInput.value.trim();
        
        if (enteredCode === this.currentSet.code) {
            this.hideAccessCodeModal();
            this.loadWritingInterface();
        } else {
            this.accessCodeError.textContent = 'Invalid code, please try again.';
            this.accessCodeInput.focus();
            this.accessCodeInput.select();
        }
    }

    loadWritingInterface() {
        // Update set info
        this.currentSetInfo.textContent = this.currentSet.name;
        
        // Load Task 1 content
        this.task1ImageContainer.innerHTML = '';
        if (this.currentSet.task1ImageUrl) {
            const img = document.createElement('img');
            img.src = this.currentSet.task1ImageUrl;
            img.alt = "Task 1 Question Image";
            img.className = 'question-image';
            img.onerror = () => {
                this.task1ImageContainer.innerHTML = '<p class="error-message">Image not found: ' + this.currentSet.task1ImageUrl + '</p>';
            };
            this.task1ImageContainer.appendChild(img);
        }
        this.task1QuestionText.textContent = this.currentSet.task1QuestionText;

        // Load Task 2 content
        this.task2ImageContainer.innerHTML = '';
        if (this.currentSet.task2ImageUrl) {
            const img = document.createElement('img');
            img.src = this.currentSet.task2ImageUrl;
            img.alt = "Task 2 Question Image";
            img.className = 'question-image';
            img.onerror = () => {
                this.task2ImageContainer.innerHTML = '<p class="error-message">Image not found: ' + this.currentSet.task2ImageUrl + '</p>';
            };
            this.task2ImageContainer.appendChild(img);
        }
        this.task2QuestionText.textContent = this.currentSet.task2QuestionText;

        // Reset answers and state
        this.task1Answer.value = '';
        this.task2Answer.value = '';
        this.updateWordCount('task1');
        this.updateWordCount('task2');
        
        this.isTestStarted = false;
        this.warningGiven = false;
        this.timer = 0;
        this.updateTimerDisplay();
        
        // Switch to writing interface
        this.mainMenu.classList.remove('active');
        this.writingInterface.classList.add('active');
        
        // Show Task 1 by default
        this.showScreen('task1');
    }

    showBackToMenuConfirmation() {
        this.confirmText.textContent = "If you go back, your current answers and timer will be cleared.";
        this.confirmModal.style.display = 'block';
    }

    confirmBackToMenu() {
        this.hideConfirmModal();
        this.resetTest();
        this.writingInterface.classList.remove('active');
        this.mainMenu.classList.add('active');
    }

    hideConfirmModal() {
        this.confirmModal.style.display = 'none';
    }

    startTest() {
        if (!this.studentName.value.trim() || !this.studentSurname.value.trim()) {
            this.showMessage('Error', 'Please enter your name and surname before starting the test.');
            return;
        }

        this.isTestStarted = true;
        this.warningGiven = false;
        this.startTestBtn.disabled = true;
        this.studentName.readOnly = true;
        this.studentSurname.readOnly = true;
        this.task1Answer.disabled = false;
        this.task2Answer.disabled = false;
        this.submitTest.disabled = false;

        // Start timer
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);

        this.showMessage('Test Started', 'Your test has started. Timer is now running. Do not switch tabs or windows during the test.');
    }

    updateTimerDisplay() {
        const hours = Math.floor(this.timer / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((this.timer % 3600) / 60).toString().padStart(2, '0');
        const seconds = (this.timer % 60).toString().padStart(2, '0');
        this.timerDisplay.textContent = `${hours}:${minutes}:${seconds}`;
    }

    showScreen(screen) {
        // Update navigation buttons
        this.task1Btn.classList.toggle('active', screen === 'task1');
        this.task2Btn.classList.toggle('active', screen === 'task2');

        // Update screens
        this.task1Screen.classList.toggle('active', screen === 'task1');
        this.task2Screen.classList.toggle('active', screen === 'task2');

        this.currentScreen = screen;
    }

    updateWordCount(task) {
        const textarea = task === 'task1' ? this.task1Answer : this.task2Answer;
        const wordCountElement = task === 'task1' ? this.task1WordCount : this.task2WordCount;
        
        const text = textarea.value.trim();
        const wordCount = text === '' ? 0 : text.split(/\s+/).filter(word => word.length > 0).length;
        wordCountElement.textContent = wordCount;
    }

    handleVisibilityChange() {
        if (!this.warningGiven) {
            // First violation - show warning
            this.warningGiven = true;
            this.showWarningModal();
        } else {
            // Second violation - reset test
            this.resetTestDueToCheating();
        }
    }

    showWarningModal() {
        this.warningModal.style.display = 'block';
    }

    hideWarningModal() {
        this.warningModal.style.display = 'none';
    }

    resetTestDueToCheating() {
        this.resetTest();
        this.showMessage('Test Reset', 'Your test has been reset because you left the page again.');
    }

    resetTest() {
        // Clear answers
        this.task1Answer.value = '';
        this.task2Answer.value = '';
        this.updateWordCount('task1');
        this.updateWordCount('task2');

        // Reset timer
        this.timer = 0;
        this.updateTimerDisplay();
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        // Reset test state
        this.isTestStarted = false;
        this.warningGiven = false;
        this.startTestBtn.disabled = false;
        this.studentName.readOnly = false;
        this.studentSurname.readOnly = false;
        this.task1Answer.disabled = true;
        this.task2Answer.disabled = true;
        this.submitTest.disabled = true;
    }

    async submitAnswers() {
        // Validation
        if (!this.studentName.value.trim() || !this.studentSurname.value.trim()) {
            this.showMessage('Error', 'Please enter your name and surname.');
            return;
        }

        if (!this.task1Answer.value.trim() && !this.task2Answer.value.trim()) {
            this.showMessage('Error', 'Please provide answers for at least one task.');
            return;
        }

        if (!this.isTestStarted) {
            this.showMessage('Error', 'Please start the test before submitting.');
            return;
        }

        // Prepare submission data
        const submissionData = {
            studentName: this.studentName.value.trim(),
            studentSurname: this.studentSurname.value.trim(),
            setId: this.currentSetId,
            setName: this.currentSet.name,
            timerValue: this.timerDisplay.textContent,
            submittedAt: new Date().toISOString(),
            task1QuestionText: this.currentSet.task1QuestionText,
            task1Answer: this.task1Answer.value,
            task2QuestionText: this.currentSet.task2QuestionText,
            task2Answer: this.task2Answer.value
        };

        // Submit to API
        await this.submitToAPI(submissionData);
    }

    async submitToAPI(data) {
        try {
            this.submitTest.disabled = true;
            this.submitTest.textContent = 'Submitting...';

            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                this.showMessage('Success', 'Your answers have been submitted successfully. Returning to main menu...');
                
                // Stop timer
                if (this.timerInterval) {
                    clearInterval(this.timerInterval);
                    this.timerInterval = null;
                }

                // Return to main menu after a delay
                setTimeout(() => {
                    this.writingInterface.classList.remove('active');
                    this.mainMenu.classList.add('active');
                    this.resetTest();
                }, 2000);
            } else {
                throw new Error(result.error || 'Submission failed');
            }
        } catch (error) {
            console.error('Submission error:', error);
            this.showMessage('Error', `Failed to submit answers: ${error.message}. Please try again.`);
        } finally {
            this.submitTest.disabled = false;
            this.submitTest.textContent = 'Submit Test';
        }
    }

    showMessage(title, text) {
        this.messageTitle.textContent = title;
        this.messageText.textContent = text;
        this.messageModal.style.display = 'block';
    }

    hideMessageModal() {
        this.messageModal.style.display = 'none';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new IELTSTest();
});
