// State
let steps = [];
let currentStep = 0;
let startTime = null;
let quizAnswers = [];
let quizScore = 0;
let estimatedTime = 1800; // Default 30 minutes in seconds (adjust per process)

console.log('Script loaded at', new Date().toLocaleTimeString());

// DOM elements with fallback check
const uploadScreen = document.getElementById('upload-screen') || console.error('upload-screen not found');
const presentationScreen = document.getElementById('presentation-screen') || console.error('presentation-screen not found');
const quizScreen = document.getElementById('quiz-screen') || console.error('quiz-screen not found');
const reportScreen = document.getElementById('report-screen') || console.error('report-screen not found');
const csvSelect = document.getElementById('csv-select') || console.error('csv-select not found');
const csvUpload = document.getElementById('csv-upload') || console.error('csv-upload not found');
const startButton = document.getElementById('start-button') || console.error('start-button not found');
const themeSelect = document.getElementById('theme-select') || console.error('theme-select not found');
const errorMessage = document.getElementById('error-message') || console.error('error-message not found');
const stepTitle = document.getElementById('step-title') || console.error('step-title not found');
const stepDescription = document.getElementById('step-description') || console.error('step-description not found');
const stepImage = document.getElementById('step-image') || console.error('step-image not found');
const timeDisplay = document.getElementById('time-display') || console.error('time-display not found');
const prevButton = document.getElementById('prev-button') || console.error('prev-button not found');
const nextButton = document.getElementById('next-button') || console.error('next-button not found');
const quizContent = document.getElementById('quiz-content') || console.error('quiz-content not found');
const submitQuiz = document.getElementById('submit-quiz') || console.error('submit-quiz not found');
const userNameInput = document.getElementById('user-name') || console.error('user-name not found');
const generateReport = document.getElementById('generate-report') || console.error('generate-report not found');

console.log('DOM elements checked:', { csvSelect, csvUpload, startButton, timeDisplay });

// Theme switching
themeSelect.addEventListener('change', () => {
    document.body.className = `${themeSelect.value} min-h-screen flex items-center justify-center`;
    console.log('Theme changed to', themeSelect.value);
});

// CSV selection from dropdown
csvSelect.addEventListener('change', () => {
    console.log('CSV selected from dropdown, value:', csvSelect.value);
    if (csvSelect.value === 'custom') {
        csvUpload.classList.remove('hidden');
        startButton.disabled = true;
        console.log('Switched to custom upload mode');
    } else {
        csvUpload.classList.add('hidden');
        startButton.disabled = true;
        errorMessage.textContent = 'Loading preloaded CSV...';
        errorMessage.classList.remove('hidden');
        fetch(csvSelect.value)
            .then(response => {
                console.log('Fetch response:', response);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.text();
            })
            .then(csvText => {
                console.log('Fetched CSV text:', csvText.substring(0, 100)); // Log first 100 chars
                Papa.parse(csvText, {
                    header: true,
                    complete: (result) => {
                        console.log('Preloaded CSV parsed, result:', result);
                        const requiredFields = ['Step', 'Description', 'Order Number', 'Image URL'];
                        if (!result.meta.fields || !requiredFields.every(field => result.meta.fields.includes(field))) {
                            errorMessage.textContent = 'Invalid CSV: Needs Step, Description, Order Number, Image URL.';
                            console.log('Invalid preloaded CSV fields:', result.meta.fields);
                            return;
                        }
                        steps = result.data.sort((a, b) => Number(a['Order Number']) - Number(b['Order Number']));
                        estimatedTime = steps.length * 150; // 150 seconds per step
                        console.log('Sorted steps from preloaded:', steps);
                        if (steps.length === 0) {
                            errorMessage.textContent = 'No steps found.';
                            console.log('No steps in preloaded CSV');
                            return;
                        }
                        errorMessage.classList.add('hidden');
                        startButton.disabled = false;
                        console.log('Start button enabled from preloaded, steps count:', steps.length);
                    },
                    error: (error) => {
                        errorMessage.textContent = `Error parsing preloaded CSV: ${error.message}`;
                        console.log('Preloaded CSV parsing error:', error);
                    }
                });
            })
            .catch(error => {
                errorMessage.textContent = `Failed to load ${csvSelect.value}: ${error.message}`;
                console.log('Fetch error for', csvSelect.value, error);
            });
    }
});

// CSV upload
csvUpload.addEventListener('change', (event) => {
    console.log('CSV file selected, event:', event, 'file:', event.target.files[0]);
    const file = event.target.files[0];
    if (!file) {
        console.log('No file selected');
        return;
    }
    startButton.disabled = true;
    errorMessage.textContent = 'Loading...';
    errorMessage.classList.remove('hidden');
    Papa.parse(file, {
        header: true,
        complete: (result) => {
            console.log('CSV parsing complete, result:', result);
            const requiredFields = ['Step', 'Description', 'Order Number', 'Image URL'];
            if (!result.meta.fields || !requiredFields.every(field => result.meta.fields.includes(field))) {
                errorMessage.textContent = 'Invalid CSV: Needs Step, Description, Order Number, Image URL.';
                console.log('Invalid CSV fields:', result.meta.fields);
                return;
            }
            steps = result.data.sort((a, b) => Number(a['Order Number']) - Number(b['Order Number']));
            estimatedTime = steps.length * 150; // 150 seconds per step
            console.log('Sorted steps:', steps);
            if (steps.length === 0) {
                errorMessage.textContent = 'No steps found.';
                console.log('No steps in CSV');
                return;
            }
            errorMessage.classList.add('hidden');
            startButton.disabled = false;
            console.log('Start button enabled, steps count:', steps.length);
        },
        error: (error) => {
            errorMessage.textContent = `Error parsing CSV: ${error.message}`;
            errorMessage.classList.remove('hidden');
            console.log('CSV parsing error:', error);
        }
    });
});

// Start button
startButton.addEventListener('click', () => {
    console.log('Start button clicked, steps length:', steps.length);
    if (!steps.length) {
        console.log('No steps to start');
        return;
    }
    startTime = new Date();
    updateTimeDisplay();
    showStep(0);
    uploadScreen.classList.add('hidden');
    presentationScreen.classList.remove('hidden');
});

// Presentation navigation
function showStep(index) {
    console.log('Showing step', index);
    if (index < 0 || index >= steps.length) return;
    currentStep = index;
    stepTitle.textContent = steps[index].Step;
    stepDescription.textContent = steps[index].Description;
    stepImage.src = steps[index]['Image URL'] || 'https://via.placeholder.com/150';
    stepImage.alt = `Step ${index + 1} Image`;
    prevButton.classList.toggle('hidden', index === 0);
    nextButton.textContent = index === steps.length - 1 ? 'Start Quiz' : 'Next';
    updateTimeDisplay();
}

function updateTimeDisplay() {
    if (!startTime) return;
    const now = new Date();
    const elapsedSeconds = Math.floor((now - startTime) / 1000);
    const minutesElapsed = Math.floor(elapsedSeconds / 60);
    const secondsElapsed = elapsedSeconds % 60;
    const minutesEstimated = Math.floor(estimatedTime / 60);
    const secondsEstimated = estimatedTime % 60;
    timeDisplay.textContent = `Elapsed: ${minutesElapsed}m ${secondsElapsed}s / Estimated: ${minutesEstimated}m ${secondsEstimated}s`;
}

// Quiz generation
nextButton.addEventListener('click', () => {
    console.log('Next button clicked');
    if (currentStep === steps.length - 1) {
        presentationScreen.classList.add('hidden');
        quizScreen.classList.remove('hidden');
        generateQuiz();
    } else {
        showStep(currentStep + 1);
    }
});

function generateQuiz() {
    quizAnswers = [];
    quizScore = 0;
    quizContent.innerHTML = '';
    const questionCount = Math.min(5, steps.length);
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
    quizAnswers.forEach((answer, index) => {
        const selected = document.querySelector(`input[name="question-${index}"]:checked`);
        if (selected && selected.value === quizContent.querySelectorAll(`input[name="question-${index}"]`)[answer.correct].value) {
            quizScore++;
        }
    });
    quizScreen.classList.add('hidden');
    reportScreen.classList.remove('hidden');
});

// Report generation
prevButton.addEventListener('click', () => {
    console.log('Previous button clicked');
    showStep(currentStep - 1);
});

generateReport.addEventListener('click', () => {
    console.log('Generate report clicked');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const userName = userNameInput.value || 'Anonymous';
    const endTime = new Date();
    const elapsedSeconds = Math.floor((endTime - startTime) / 1000);
    const minutesElapsed = Math.floor(elapsedSeconds / 60);
    const secondsElapsed = elapsedSeconds % 60;
    const minutesEstimated = Math.floor(estimatedTime / 60);
    const secondsEstimated = estimatedTime % 60;

    doc.setFontSize(16);
    doc.text(`SlideCraft Report - ${userName}`, 10, 10);
    doc.text(`Time Elapsed: ${minutesElapsed}m ${secondsElapsed}s / Estimated: ${minutesEstimated}m ${secondsEstimated}s`, 10, 20);
    doc.text('Steps:', 10, 30);
    steps.forEach((step, index) => {
        doc.text(`${index + 1}. ${step.Step}: ${step.Description}`, 10, 40 + index * 10);
    });
    doc.text(`Quiz Score: ${quizScore}/${Math.min(5, steps.length)}`, 10, 50 + steps.length * 10);

    doc.save(`Report_${userName}.pdf`);
});
