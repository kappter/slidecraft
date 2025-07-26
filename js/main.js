```javascript
let steps = [];
let currentStep = 0;
let startTime, endTime;
let quizQuestions = [];
let currentQuestion = 0;
let quizScore = 0;
let userAnswers = [];
let uploadedPhoto = null;

document.getElementById('theme').addEventListener('change', (e) => {
    document.body.className = e.target.value;
});

document.getElementById('csv-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        Papa.parse(file, {
            header: true,
            complete: (result) => {
                if (validateCSV(result.data)) {
                    steps = result.data.sort((a, b) => a['Order Number'] - b['Order Number']);
                    document.getElementById('start-btn').disabled = false;
                    document.getElementById('error').classList.add('hidden');
                } else {
                    showError('Invalid CSV format. Required columns: Step, Description, Order Number, Image URL');
                }
            }
        });
    }
});

document.getElementById('start-btn').addEventListener('click', () => {
    if (steps.length > 0) {
        startTime = new Date();
        showPresentation();
        displayStep(0);
    }
});

document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentStep > 0) displayStep(currentStep - 1);
});

document.getElementById('next-btn').addEventListener('click', () => {
    if (currentStep < steps.length - 1) {
        displayStep(currentStep + 1);
    } else {
        endTime = new Date();
        generateQuiz();
        showQuiz();
    }
});

document.getElementById('next-question').addEventListener('click', () => {
    if (currentQuestion < quizQuestions.length - 1) {
        currentQuestion++;
        displayQuestion();
    } else {
        showReport();
    }
});

document.getElementById('photo-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024 && ['image/jpeg', 'image/png'].includes(file.type)) {
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedPhoto = e.target.result;
            document.getElementById('photo-preview').src = uploadedPhoto;
            document.getElementById('photo-preview').classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    } else {
        showError('Please upload a JPEG or PNG image (max 5MB).');
    }
});

document.getElementById('generate-report').addEventListener('click', generatePDF);

document.addEventListener('keydown', (e) => {
    if (document.getElementById('presentation').classList.contains('hidden')) return;
    if (e.key === 'ArrowLeft' && currentStep > 0) displayStep(currentStep - 1);
    if (e.key === 'ArrowRight' && currentStep < steps.length - 1) displayStep(currentStep + 1);
    if (e.key === 'ArrowRight' && currentStep === steps.length - 1) {
        endTime = new Date();
        generateQuiz();
        showQuiz();
    }
});

function validateCSV(data) {
    const required = ['Step', 'Description', 'Order Number', 'Image URL'];
    return data.length > 0 && required.every(col => Object.keys(data[0]).includes(col));
}

function showError(message) {
    const error = document.getElementById('error');
    error.textContent = message;
    error.classList.remove('hidden');
}

function showPresentation() {
    document.getElementById('upload-section').classList.add('hidden');
    document.getElementById('presentation').classList.remove('hidden');
}

function displayStep(index) {
    currentStep = index;
    const step = steps[index];
    document.getElementById('step-title').textContent = step.Step;
    document.getElementById('step-description').textContent = step.Description;
    const img = document.getElementById('step-image');
    img.src = step['Image URL'] || 'assets/placeholder.jpg';
    img.onerror = () => { img.src = 'assets/placeholder.jpg'; };
}

function generateQuiz() {
    quizQuestions = [];
    for (let i = 0; i < 5 && i < steps.length; i++) {
        const step = steps[i];
        const question = {
            text: `What is Step ${step['Order Number']}?`,
            correct: step.Step,
            options: [step.Step]
        };
        while (question.options.length < 4) {
            const randomStep = steps[Math.floor(Math.random() * steps.length)].Step;
            if (!question.options.includes(randomStep)) question.options.push(randomStep);
        }
        question.options.sort(() => Math.random() - 0.5);
        quizQuestions.push(question);
    }
}

function showQuiz() {
    document.getElementById('presentation').classList.add('hidden');
    document.getElementById('quiz').classList.remove('hidden');
    currentQuestion = 0;
    quizScore = 0;
    userAnswers = [];
    displayQuestion();
}

function displayQuestion() {
    const question = quizQuestions[currentQuestion];
    document.getElementById('question').textContent = question.text;
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    question.options.forEach((option, i) => {
        const btn = document.createElement('button');
        btn.className = 'bg-gray-200 text-black px-4 py-2 rounded w-full';
        btn.textContent = option;
        btn.onclick = () => checkAnswer(option, question.correct);
        optionsDiv.appendChild(btn);
    });
    document.getElementById('quiz-feedback').textContent = '';
    document.getElementById('next-question').classList.add('hidden');
}

function checkAnswer(selected, correct) {
    const feedback = document.getElementById('quiz-feedback');
    if (selected === correct) {
        quizScore++;
        feedback.textContent = 'Correct!';
        feedback.className = 'text-green-500 mt-4';
    } else {
        feedback.textContent = `Incorrect. The correct answer is: ${correct}`;
        feedback.className = 'text-red-500 mt-4';
    }
    userAnswers.push({ question: quizQuestions[currentQuestion].text, selected, correct });
    document.getElementById('next-question').classList.remove('hidden');
}

function showReport() {
    document.getElementById('quiz').classList.add('hidden');
    document.getElementById('report').classList.remove('hidden');
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const userName = document.getElementById('user-name').value || 'Anonymous';
    const taskName = document.getElementById('csv-file').files[0]?.name.replace('.csv', '') || 'Task';
    const timeTaken = formatTime(endTime - startTime);

    doc.setFontSize(16);
    doc.text('SlideCraft Report', 10, 10);
    doc.setFontSize(12);
    doc.text(`Name: ${userName}`, 10, 20);
    doc.text(`Task: ${taskName}`, 10, 30);
    doc.text(`Time Taken: You finished the ${taskName} task in ${timeTaken}`, 10, 40);
    doc.text(`Quiz Score: ${quizScore}/5`, 10, 50);

    doc.text('Quiz Answers:', 10, 60);
    userAnswers.forEach((answer, i) => {
        doc.text(`${i + 1}. ${answer.question}`, 10, 70 + i * 20);
        doc.text(`Your Answer: ${answer.selected}`, 20, 75 + i * 20);
        doc.text(`Correct Answer: ${answer.correct}`, 20, 80 + i * 20);
    });

    let yPos = 70 + userAnswers.length * 20 + 10;
    if (uploadedPhoto) {
        doc.text('Uploaded Photo:', 10, yPos);
        doc.addImage(uploadedPhoto, 'JPEG', 10, yPos + 10, 80, 60);
        yPos += 80;
    }

    doc.text('Process Summary:', 10, yPos);
    steps.forEach((step, i) => {
        doc.text(`${step['Order Number']}. ${step.Step}: ${step.Description}`, 10, yPos + 10 + i * 10);
    });

    doc.save(`Process_Report_${taskName}.pdf`);
}

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
```