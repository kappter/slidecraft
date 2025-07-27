// Initialize state
let steps = [];
let currentStep = 0;
let startTime = null;
let quizAnswers = [];
let quizScore = 0;
let taskName = '';
let userPhoto = null;
let userQuizResponses = [];

// DOM elements
const uploadScreen = document.getElementById('upload-screen');
const presentationScreen = document.getElementById('presentation-screen');
const quizScreen = document.getElementById('quiz-screen');
const reportScreen = document.getElementById('report-screen');
const csvSelect = document.getElementById('csv-select');
const csvUpload = document.getElementById('csv-upload');
const themeSelect = document.getElementById('theme-select');
const errorMessage = document.getElementById('error-message');
const stepTitle = document.getElementById('step-title');
const stepDescription = document.getElementById('step-description');
const stepImage = document.getElementById('step-image');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const quizContent = document.getElementById('quiz-content');
const submitQuiz = document.getElementById('submit-quiz');
const userNameInput = document.getElementById('user-name');
const photoUpload = document.getElementById('photo-upload');
const photoPreview = document.getElementById('photo-preview');
const generateReport = document.getElementById('generate-report');

// Theme switching
themeSelect.addEventListener('change', () => {
    document.body.className = themeSelect.value + ' min-h-screen flex flex-col items-center justify-center';
});

// CSV selection handling
csvSelect.addEventListener('change', () => {
    if (csvSelect.value === 'custom') {
        csvUpload.classList.remove('hidden');
        csvUpload.value = ''; // Clear file input
    } else {
        csvUpload.classList.add('hidden');
        loadPreloadedCSV(csvSelect.value);
    }
});

// Load pre-loaded CSV
function loadPreloadedCSV(fileName) {
    const csvPath = `assets/${fileName}.csv`;
    taskName = fileName.replace(/(^\w|-\w)/g, c => c.toUpperCase().replace('-', ' '));
    fetch(csvPath)
        .then(response => {
            if (!response.ok) throw new Error('Failed to load CSV');
            return response.text();
        })
        .then(csvText => {
            Papa.parse(csvText, {
                header: true,
                complete: (result) => {
                    const requiredFields = ['Step', 'Description', 'Order Number', 'Image URL'];
                    if (!result.meta.fields || !requiredFields.every(field => result.meta.fields.includes(field))) {
                        errorMessage.textContent = 'Invalid CSV format.';
                        errorMessage.classList.remove('hidden');
                        return;
                    }
                    errorMessage.classList.add('hidden');
                    steps = result.data.sort((a, b) => Number(a['Order Number']) - Number(b['Order Number']));
                    if (steps.length === 0) {
                        errorMessage.textContent = 'No valid steps found in CSV.';
                        errorMessage.classList.remove('hidden');
                        return;
                    }
                    startTime = new Date();
                    showStep(0);
                    uploadScreen.classList.add('hidden');
                    presentationScreen.classList.remove('hidden');
                }
            });
        })
        .catch(() => {
            errorMessage.textContent = 'Failed to load pre-loaded CSV.';
            errorMessage.classList.remove('hidden');
        });
}

// Custom CSV upload
csvUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    taskName = file.name.replace('.csv', '').replace(/(^\w|-\w)/g, c => c.toUpperCase().replace('-', ' '));
    Papa.parse(file, {
        header: true,
        complete: (result) => {
            const requiredFields = ['Step', 'Description', 'Order Number', 'Image URL'];
            if (!result.meta.fields || !requiredFields.every(field => result.meta.fields.includes(field))) {
                errorMessage.classList.remove('hidden');
                return;
            }
            errorMessage.classList.add('hidden');
            steps = result.data.sort((a, b) => Number(a['Order Number']) - Number(b['Order Number']));
            if (steps.length === 0) {
                errorMessage.textContent = 'No valid steps found in CSV.';
                errorMessage.classList.remove('hidden');
                return;
            }
            startTime = new Date();
            showStep(0);
            uploadScreen.classList.add('hidden');
            presentationScreen.classList.remove('hidden');
        }
    });
});

// Presentation navigation
function showStep(index) {
    if (index < 0 || index >= steps.length) return;
    currentStep = index;
    stepTitle.textContent = steps[index].Step;
    stepDescription.textContent = steps[index].Description;
    stepImage.src = steps[index]['Image URL'] || 'assets/placeholder.jpg';
    stepImage.onerror = () => { stepImage.src = 'assets/placeholder.jpg'; };
    prevButton.classList.toggle('hidden', index === 0);
    nextButton.textContent = index === steps.length - 1 ? 'Start Quiz' : 'Next';
}

prevButton.addEventListener('click', () => showStep(currentStep - 1));
nextButton.addEventListener('click', () => {
    if (currentStep === steps.length - 1) {
        presentationScreen.classList.add('hidden');
        quizScreen.classList.remove('hidden');
        generateQuiz();
    } else {
        showStep(currentStep + 1);
    }
});

// Keyboard navigation
document.addEventListener('keydown', (event) => {
    if (presentationScreen.classList.contains('hidden')) return;
    if (event.key === 'ArrowLeft') showStep(currentStep - 1);
    if (event.key === 'ArrowRight') showStep(currentStep + 1);
});

// Quiz generation
function generateQuiz() {
    quizAnswers = [];
    quizScore = 0;
    userQuizResponses = [];
    quizContent.innerHTML = '';
    const questionCount = 5;
    const shuffledSteps = [...steps].sort(() => Math.random() - 0.5).slice(0, questionCount);
    
    shuffledSteps.forEach((step, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'mb-4';
        questionDiv.innerHTML = `<p class="font-bold">Question ${index + 1}: What is Step ${step['Order Number']}?</p>`;
        
        const options = [step.Step];
        while (options.length < 4) {
            const randomStep = steps[Math.floor(Math.random() * steps.length)].Step;
            if (!options.includes(randomStep)) options.push(randomStep);
        }
        options.sort(() => Math.random() - 0.5);
        
        options.forEach((option, optIndex) => {
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `question-${index}`;
            input.value = option;
            input.className = 'mr-2';
            const label = document.createElement('label');
            label.textContent = option;
            label.className = 'mr-4';
            questionDiv.appendChild(input);
            questionDiv.appendChild(label);
            questionDiv.appendChild(document.createElement('br'));
            if (option === step.Step) quizAnswers.push({ question: index, correct: optIndex, correctAnswer: step.Step });
        });
        
        quizContent.appendChild(questionDiv);
    });
    
    submitQuiz.classList.remove('hidden');
}

// Quiz submission
submitQuiz.addEventListener('click', () => {
    quizScore = 0;
    userQuizResponses = [];
    quizAnswers.forEach((answer, index) => {
        const selected = document.querySelector(`input[name="question-${index}"]:checked`);
        const userAnswer = selected ? selected.value : 'No answer';
        const isCorrect = selected && selected.value === quizContent.querySelectorAll