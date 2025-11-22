// Modern IELTS Writing Pro Application
class IELTSWritingApp {
    constructor() {
        this.currentScreen = 'intro';
        this.currentTask = 1;
        this.currentSet = null;
        this.totalTime = 60 * 60; // 60 minutes in seconds
        this.timeLeft = this.totalTime;
        this.timerInterval = null;
        this.isTestStarted = false;
        this.warningShown = false;
        this.isFocusMode = false;
        this.studentName = '';
        this.studentSurname = '';
        
        this.typingMonitor = {
            lastKeyTime: 0,
            keyCount: 0,
            warningThreshold: 30, // characters in 5 seconds
            checkInterval: null
        };
        
        this.writingSets = {
            set1: {
                name: "Set 1 - Film Production & Family History",
                code: "versage_100",
                task1: {
                    question: "The charts below show the number of films produced by five countries in three years.",
                    image: "IMAGE%202025-11-21%2020%3A42%3A23.jpg"
                },
                task2: {
                    question: "It is becoming increasingly popular to try to find out the history of one's own family. Why might people want to do this? Is it a positive or negative development?"
                }
            },
            set2: {
                name: "Set 2 - Coming Soon",
                code: "coming_soon",
                task1: { question: "This set is currently under development." },
                task2: { question: "New content will be available soon." }
            },
            set3: {
                name: "Set 3 - Coming Soon", 
                code: "coming_soon",
                task1: { question: "This set is currently under development." },
                task2: { question: "New content will be available soon." }
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
        this.loadSets();
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
        document.getElementById('setsGrid').addEventListener('click', (e) => {
            const setCard = e.target.closest('.set-card');
            if (setCard && !setCard.classList.contains('coming-soon')) {
                const setId = setCard.dataset.set;
                this.showAccessCodeModal(setId);
            }
        });

        // Access code modal
        document.getElementById('submitCode').addEventListener('click', () => this.checkAccessCode());
        document.getElementById('cancelCode').addEventListener('click', () => this.hideModal('codeModal'));
        document.getElementById('closeCodeModal').addEventListener('click', () => this.hideModal('codeModal'));
        document.getElementById('accessCode').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkAccessCode();
        });

        // Test controls
        document.getElementById('startTestBtn').addEventListener('click', () => this.startTest());
        document.getElementById('submitBtn').addEventListener('click', () => this.submitTest());
        document.getElementById('backToMenuBtn').addEventListener('click', () => this.confirmExit());

        // Task navigation
        document.querySelectorAll('.task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const task = parseInt(e.currentTarget.dataset.task);
                this.switchTask(task);
            });
