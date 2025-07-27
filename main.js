let steps = [];
let currentStep = 0;
let startTime = null;
let quizAnswers = [];
let quizScore = 0;
let taskName = '';
let userPhoto = null;
let userQuizResponses = [];
let autoAdvanceInterval = null;

const uploadScreen = document.getElementById('upload-screen');
const presentationScreen = document.getElementById('presentation-screen');
const quizScreen = document.getElementById('quiz-screen');
const reportScreen = document.getElementById('report-screen');
const csvUpload = document.getElementById('csv-upload');
const startButton = document.getElementById('start-button');
const themeSelect = document.getElementById('theme-select');
const assetsSelect = document.getElementById('assets-select');
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
const autoAdvanceCheckbox = document.getElementById('auto-advance');

// Theme switching
themeSelect.addEventListener('change', () => {
    document.body.className = themeSelect.value + '-theme min-h-screen flex flex-col';
});

// Populate assets dropdown from processes.json
fetch('assets/processes.json')
    .then(response => response.json())
    .then(processes => {
        processes.forEach(proc => {
            const option = document.createElement('option');
            option.value = `assets/${proc.file}`;
            option.textContent = proc.name;
            assetsSelect.appendChild(option);
        });
    })
    .catch(err => {
        console.error('Error loading processes:', err);
        errorMessage.textContent = 'Failed to load process list.';
        errorMessage.classList.remove('hidden');
    });

// Handle asset selection
assetsSelect.addEventListener('change', () => {
    const selectedFile = assetsSelect.value;
    if (selectedFile) {
        Papa.parse(`https://kappter.github.io/slidecraft/${selectedFile}`, {
            download: true,
            header: true,
            complete: (result) => {
                const requiredFields = ['Step', 'Description', 'Order Number', 'Image URL', 'Duration'];
                if (!result.meta.fields || !requiredFields.every(field => result.meta.fields.includes(field))) {
                    errorMessage.textContent = 'Invalid CSV file. Please ensure it contains Step, Description, Order Number, Image URL, and Duration columns.';
                    errorMessage.classList.remove('hidden');
                    return;
                }
                errorMessage.classList.add('hidden');
                steps = result.data.map(step => ({
                    ...step,
                    Duration: parseInt(step.Duration) || 5
                })).sort((a, b) => Number(a['Order Number']) - Number(b['Order Number']));
                taskName = selectedFile.replace('assets/', '').replace('.csv', '').replace(/(^\w|-\w)/g, c => c.toUpperCase().replace('-', ' '));
                startButton.disabled = false;
            },
            error: (err) => {
                errorMessage.textContent = 'Error loading CSV file.';
                errorMessage.classList.remove('hidden');
                console.error('CSV load error:', err);
            }
        });
    } else {
        startButton.disabled = !csvUpload.files.length;
    }
});

// CSV upload event
csvUpload.addEventListener('change', () => {
    startButton.disabled = !csvUpload.files.length && !assetsSelect.value;
});

// Start button handler
startButton.addEventListener('click', () => {
    if (!csvUpload.files.length && !assetsSelect.value) {
        errorMessage.textContent = 'Please select a CSV file or an asset.';
        errorMessage.classList.remove('hidden');
        return;
    }
    if (csvUpload.files.length) {
        const file = csvUpload.files[0];
        taskName = file.name.replace('.csv', '').replace(/(^\w|-\w)/g, c => c.toUpperCase().replace('-', ' '));
        Papa.parse(file, {
            header: true,
            complete: (result) => {
                const requiredFields = ['Step', 'Description', 'Order Number', 'Image URL', 'Duration'];
                if (!result.meta.fields || !requiredFields.every(field => result.meta.fields.includes(field))) {
                    errorMessage.textContent = 'Invalid CSV file. Please ensure it contains Step, Description, Order Number, Image URL, and Duration columns.';
                    errorMessage.classList.remove('hidden');
                    return;
                }
                errorMessage.classList.add('hidden');
                steps = result.data.map(step => ({
                    ...step,
                    Duration: parseInt(step.Duration) || 5
                })).sort((a, b) => Number(a['Order Number']) - Number(b['Order Number']));
                if (steps.length === 0) {
                    errorMessage.textContent = 'No valid steps found in CSV.';
                    errorMessage.classList.remove('hidden');
                    return;
                }
                startTime = new Date();
                showStep(0);
                uploadScreen.classList.add('hidden');
                presentationScreen.classList.remove('hidden');
                if (autoAdvanceCheckbox.checked) startAutoAdvance();
            },
            error: (err) => {
                errorMessage.textContent = 'Error parsing CSV file.';
                errorMessage.classList.remove('hidden');
                console.error('CSV parse error:', err);
            }
        });
    } else {
        startTime = new Date();
        showStep(0);
        uploadScreen.classList.add('hidden');
        presentationScreen.classList.remove('hidden');
        if (autoAdvanceCheckbox.checked) startAutoAdvance();
    }
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
    if (autoAdvanceInterval) clearInterval(autoAdvanceInterval);
    if (autoAdvanceCheckbox.checked && index < steps.length - 1) startAutoAdvance();
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

// Auto-advance function
function startAutoAdvance() {
    autoAdvanceInterval = setInterval(() => {
        if (currentStep < steps.length - 1) {
            showStep(currentStep + 1);
        } else {
            clearInterval(autoAdvanceInterval);
            presentationScreen.classList.add('hidden');
            quizScreen.classList.remove('hidden');
            generateQuiz();
        }
    }, steps[currentStep].Duration * 1000);
}

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
        const isCorrect = selected && selected.value === quizContent.querySelectorAll(`input[name="question-${index}"]`)[answer.correct].value;
        if (isCorrect) quizScore++;
        userQuizResponses.push({
            question: `Question ${index + 1}: What is Step ${steps.find(s => s.Step === answer.correctAnswer)['Order Number']}?`,
            userAnswer: userAnswer,
            correctAnswer: answer.correctAnswer,
            isCorrect: isCorrect
        });
    });
    quizScreen.classList.add('hidden');
    reportScreen.classList.remove('hidden');
});

// Photo upload
photoUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file || file.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png'].includes(file.type)) {
        alert('Please upload a JPEG or PNG image under 5MB.');
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        userPhoto = reader.result;
        photoPreview.src = userPhoto;
        photoPreview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
});

// Report generation
generateReport.addEventListener('click', () => {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const userName = userNameInput.value || 'Anonymous';
        const endTime = new Date();
        const timeTaken = startTime ? Math.floor((endTime - startTime) / 1000) : 0;
        const averageTime = 300;
        const hours = Math.floor(timeTaken / 3600);
        const minutes = Math.floor((timeTaken % 3600) / 60);
        const seconds = timeTaken % 60;

        doc.setFillColor(30, 64, 175);
        doc.rect(0, 0, 210, 20, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.text(`SlideCraft Report: ${taskName || 'Untitled'}`, 10, 15);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Name: ${userName}`, 10, 30);
        doc.text(`Task: ${taskName || 'Untitled'}`, 10, 40);
        doc.text(`Time Taken: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`, 10, 50);
        doc.text(`Average Time: 00:05:00`, 10, 60);
        doc.setTextColor(34, 139, 34);
        if (timeTaken > averageTime) doc.setTextColor(220, 20, 60);
        doc.text(`Performance: ${timeTaken < averageTime ? 'Faster' : timeTaken > averageTime ? 'Slower' : 'Equal'} than average`, 10, 70);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(`Quiz Score: ${quizScore}/5`, 10, 90);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        let yPos = 100;
        userQuizResponses.forEach((response, index) => {
            doc.text(response.question, 10, yPos);
            doc.text(`Your Answer: ${response.userAnswer}`, 10, yPos + 5);
            doc.text(`Correct Answer: ${response.correctAnswer}`, 10, yPos + 10);
            doc.setTextColor(response.isCorrect ? 34, 139, 34 : 220, 20, 60);
            doc.text(`Status: ${response.isCorrect ? 'Correct' : 'Incorrect'}`, 10, yPos + 15);
            doc.setTextColor(0, 0, 0);
            yPos += 25;
        });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Process Steps:', 10, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        steps.forEach((step, index) => {
            doc.text(`${index + 1}. ${step.Step}: ${step.Description.substring(0, 50)}${step.Description.length > 50 ? '...' : ''} (Duration: ${step.Duration}s)`, 10, yPos + 10 + index * 10);
        });

        if (userPhoto && typeof userPhoto === 'string' && userPhoto.startsWith('data:image')) {
            try {
                doc.addImage(userPhoto, 'JPEG', 10, yPos + 10 + steps.length * 10, 50, 50);
            } catch (imgError) {
                console.error('Error adding image to PDF:', imgError);
            }
        }

        doc.save(`Process_Report_${taskName || 'Untitled'}.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        errorMessage.textContent = 'Failed to generate PDF report.';
        errorMessage.classList.remove('hidden');
    }
});
