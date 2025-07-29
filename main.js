let steps = [];
let currentStep = 0;
let startTime = null;
let quizAnswers = [];
let quizScore = 0;
let taskName = '';
let userPhoto = null;
let userQuizResponses = [];
let autoAdvanceInterval = null;
let timeInterval = null;

const uploadScreen = document.getElementById('upload-screen');
const presentationScreen = document.getElementById('presentation-screen');
const quizScreen = document.getElementById('quiz-screen');
const reportPreview = document.getElementById('report-preview');
const csvUpload = document.getElementById('csv-upload');
const startButton = document.getElementById('start-button');
const themeSelect = document.getElementById('theme-select');
const assetsSelect = document.getElementById('assets-select');
const errorMessage = document.getElementById('error-message');
const stepTitle = document.getElementById('step-title');
const stepNumber = document.getElementById('step-number');
const stepDescription = document.getElementById('step-description');
const stepImage = document.getElementById('step-image');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const quizContent = document.getElementById('quiz-content');
const submitQuiz = document.getElementById('submit-quiz');
const restartQuiz = document.getElementById('restart-quiz');
const reportNameInput = document.getElementById('report-name');
const userNameInput = document.getElementById('user-name');
const photoUpload = document.getElementById('photo-upload');
const photoPreview = document.getElementById('photo-preview');
const photoUploadQuiz = document.getElementById('photo-upload-quiz');
const photoPreviewQuiz = document.getElementById('photo-preview-quiz');
const autoAdvanceCheckbox = document.getElementById('auto-advance');
const timeInfo = document.getElementById('time-info');
const versionInfo = document.getElementById('version-info');
const reportContent = document.getElementById('report-content');
const printReport = document.getElementById('print-report');
const designSelect = document.getElementById('design-select');
const chooseFileSpan = document.getElementById('choose-file-span');

// Theme switching
themeSelect.addEventListener('change', () => {
    document.body.className = `${themeSelect.value}-theme min-h-screen flex flex-col ${designSelect.value}`;
});

// Design toggle
designSelect.addEventListener('change', () => {
    document.body.className = `${themeSelect.value}-theme min-h-screen flex flex-col ${designSelect.value}`;
});

// Populate assets dropdown from processes.json
fetch('assets/processes.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch processes.json');
        }
        return response.json();
    })
    .then(processes => {
        assetsSelect.innerHTML = '<option value="">Select an asset</option>';
        if (Array.isArray(processes) && processes.length > 0) {
            processes.forEach(proc => {
                if (proc.name && proc.file) {
                    const option = document.createElement('option');
                    option.value = `assets/${proc.file}`;
                    option.textContent = proc.name;
                    assetsSelect.appendChild(option);
                }
            });
        } else {
            console.warn('processes.json is empty or invalid:', processes);
            errorMessage.textContent = 'No processes available. Check processes.json.';
            errorMessage.classList.remove('hidden');
        }
    })
    .catch(err => {
        console.error('Error loading processes:', err);
        errorMessage.textContent = 'Failed to load process list. Check console for details.';
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
                reportNameInput.value = taskName;
            },
            error: (err) => {
                errorMessage.textContent = 'Error loading CSV file.';
                errorMessage.classList.remove('hidden');
                console.error('CSV load error:', err);
            }
        });
    } else {
        startButton.disabled = !csvUpload.files.length;
        reportNameInput.value = '';
    }
});

// CSV upload event
csvUpload.addEventListener('change', () => {
    startButton.disabled = !csvUpload.files.length && !assetsSelect.value;
    if (csvUpload.files.length) {
        const file = csvUpload.files[0];
        taskName = file.name.replace('.csv', '').replace(/(^\w|-\w)/g, c => c.toUpperCase().replace('-', ' '));
        reportNameInput.value = taskName;
    }
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
                startTimeUpdate();
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
        startTimeUpdate();
    }
});

// Presentation navigation
function showStep(index) {
    if (index < 0 || index >= steps.length) return;
    currentStep = index;
    stepTitle.textContent = steps[index].Step;
    stepNumber.textContent = `Step ${index + 1} of ${steps.length}`;
    stepDescription.textContent = steps[index].Description;
    let imageSrc = steps[index]['Image URL'] || '';
    if (!imageSrc || imageSrc === 'assets/placeholder.jpg') {
        imageSrc = generateInkblot();
        stepImage.classList.add('inkblot'); // Add class for animation
    } else {
        stepImage.classList.remove('inkblot'); // Remove animation for real images
        stepImage.onerror = () => { 
            stepImage.src = generateInkblot(); 
            stepImage.classList.add('inkblot'); 
        };
    }
    stepImage.src = imageSrc;
    prevButton.classList.toggle('hidden', index === 0);
    nextButton.textContent = index === steps.length - 1 ? 'Start Quiz' : 'Next';
    if (autoAdvanceInterval) clearInterval(autoAdvanceInterval);
    if (autoAdvanceCheckbox.checked && index < steps.length - 1) startAutoAdvance();
}

prevButton.addEventListener('click', () => showStep(currentStep - 1));
nextButton.addEventListener('click', () => {
    if (currentStep === steps.length - 1) {
        if (autoAdvanceInterval) clearInterval(autoAdvanceInterval);
        if (timeInterval) clearInterval(timeInterval);
        presentationScreen.classList.add('hidden');
        quizScreen.classList.remove('hidden');
        generateQuiz();
    } else {
        showStep(currentStep + 1);
    }
});

// Auto-advance function
function startAutoAdvance() {
    if (autoAdvanceInterval) clearInterval(autoAdvanceInterval);
    const duration = steps[currentStep].Duration * 1000;
    autoAdvanceInterval = setInterval(() => {
        if (currentStep < steps.length - 1) {
            showStep(currentStep + 1);
        } else {
            clearInterval(autoAdvanceInterval);
            if (timeInterval) clearInterval(timeInterval);
            presentationScreen.classList.add('hidden');
            quizScreen.classList.remove('hidden');
            generateQuiz();
        }
    }, duration);
}

// Time update function
function startTimeUpdate() {
    if (timeInterval) clearInterval(timeInterval);
    timeInterval = setInterval(() => {
        if (startTime && presentationScreen.classList.contains('hidden')) {
            clearInterval(timeInterval);
            return;
        }
        const now = new Date();
        const elapsed = Math.floor((now - startTime) / 1000);
        const average = 300;
        const elapsedHours = Math.floor(elapsed / 3600);
        const elapsedMinutes = Math.floor((elapsed % 3600) / 60);
        const elapsedSeconds = elapsed % 60;
        const avgHours = Math.floor(average / 3600);
        const avgMinutes = Math.floor((average % 3600) / 60);
        const avgSeconds = average % 60;
        timeInfo.textContent = `Elapsed: ${elapsedHours.toString().padStart(2, '0')}:${elapsedMinutes.toString().padStart(2, '0')}:${elapsedSeconds.toString().padStart(2, '0')} / 00:${avgMinutes.toString().padStart(2, '0')}:${avgSeconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Keyboard navigation
document.addEventListener('keydown', (event) => {
    if (presentationScreen.classList.contains('hidden')) return;
    if (event.key === 'ArrowLeft') showStep(currentStep - 1);
    if (event.key === 'ArrowRight') showStep(currentStep + 1);
});

// Quiz generation
function generateQuiz() {
    if (autoAdvanceInterval) clearInterval(autoAdvanceInterval);
    if (timeInterval) clearInterval(timeInterval);
    quizAnswers = [];
    quizScore = 0;
    userQuizResponses = [];
    quizContent.innerHTML = '';

    const questionCount = Math.max(4, Math.ceil(steps.length / 4));
    const shuffledSteps = [...steps].sort(() => Math.random() - 0.5).slice(0, questionCount);

    const questionTypes = [
        (step, index) => {
            const descWords = step.Description.split(' ').slice(0, 10).join(' ');
            const questionText = `Which step matches this description: "${descWords}..."?`;
            const correctAnswer = step.Step;
            const options = [correctAnswer];
            while (options.length < 4) {
                const randomStep = steps[Math.floor(Math.random() * steps.length)].Step;
                if (!options.includes(randomStep)) options.push(randomStep);
            }
            options.sort(() => Math.random() - 0.5);
            return { questionText, correctAnswer, options, index };
        },
        (step, index) => {
            const keyAction = step.Description.split('. ')[0].substring(0, 50);
            const questionText = `Which step involves: "${keyAction}..."?`;
            const correctAnswer = step.Step;
            const options = [correctAnswer];
            while (options.length < 4) {
                const randomStep = steps[Math.floor(Math.random() * steps.length)].Step;
                if (!options.includes(randomStep)) options.push(randomStep);
            }
            options.sort(() => Math.random() - 0.5);
            return { questionText, correctAnswer, options, index };
        },
        (step, index) => {
            const descParts = step.Description.split(' ');
            if (descParts.length < 5) return null;
            const blankIndex = Math.floor(Math.random() * (descParts.length - 2)) + 1;
            descParts[blankIndex] = '_____';
            const questionText = `Fill in the blank for this step description: "${descParts.join(' ')}..."`;
            const correctAnswer = step.Step;
            const options = [correctAnswer];
            while (options.length < 4) {
                const randomStep = steps[Math.floor(Math.random() * steps.length)].Step;
                if (!options.includes(randomStep)) options.push(randomStep);
            }
            options.sort(() => Math.random() - 0.5);
            return { questionText, correctAnswer, options, index };
        }
    ];

    shuffledSteps.forEach((step, index) => {
        const validQuestionTypes = questionTypes.filter(type => {
            const result = type(step, index);
            return result !== null;
        });
        if (validQuestionTypes.length === 0) return;
        const questionType = validQuestionTypes[Math.floor(Math.random() * validQuestionTypes.length)];
        const { questionText, correctAnswer, options, index: qIndex } = questionType(step, index);

        const questionDiv = document.createElement('div');
        questionDiv.className = 'mb-4';
        questionDiv.innerHTML = `<p class="font-bold">Question ${index + 1}: ${questionText}</p>`;

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
            if (option === correctAnswer) {
                quizAnswers.push({ question: index, correct: optIndex, correctAnswer, questionText });
            }
        });

        quizContent.appendChild(questionDiv);
    });

    submitQuiz.classList.remove('hidden');
    restartQuiz.classList.remove('hidden');
}

// Quiz submission
submitQuiz.addEventListener('click', () => {
    if (!photoUploadQuiz.files || !photoUploadQuiz.files[0]) {
        alert('Please upload a photo before submitting the report.');
        return;
    }
    quizScore = 0;
    userQuizResponses = [];
    quizAnswers.forEach((answer, index) => {
        const selected = document.querySelector(`input[name="question-${index}"]:checked`);
        const userAnswer = selected ? selected.value : 'No answer';
        const isCorrect = selected && selected.value === answer.correctAnswer;
        if (isCorrect) quizScore++;
        userQuizResponses.push({
            question: answer.questionText,
            userAnswer,
            correctAnswer: answer.correctAnswer,
            isCorrect
        });
    });
    quizScreen.classList.add('hidden');
    reportPreview.classList.remove('hidden');
    generateReportPreview();
});

// Restart quiz
restartQuiz.addEventListener('click', () => {
    quizScreen.classList.remove('hidden');
    reportPreview.classList.add('hidden');
    generateQuiz();
});

// Handle photo upload for quiz
photoUploadQuiz.addEventListener('change', (event) => {
    const file = event.target.files[0];
    handlePhotoUpload(file, photoPreviewQuiz);
});

// Handle photo upload for report
photoUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    handlePhotoUpload(file, photoPreview);
});

// Ensure chooseFileSpan triggers file input
chooseFileSpan.addEventListener('click', () => {
    photoUploadQuiz.click();
});

function handlePhotoUpload(file, previewElement) {
    if (!file) {
        alert('No file selected. Please choose a file.');
        previewElement.classList.add('hidden');
        userPhoto = null;
        return;
    }
    if (file.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png'].includes(file.type)) {
        alert('Please upload a JPEG or PNG image under 5MB.');
        previewElement.classList.add('hidden');
        userPhoto = null;
        if (previewElement === photoPreviewQuiz) {
            photoUploadQuiz.value = '';
        } else {
            photoUpload.value = '';
        }
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        userPhoto = reader.result;
        previewElement.src = userPhoto;
        previewElement.classList.remove('hidden');
        if (!reportPreview.classList.contains('hidden')) {
            generateReportPreview();
        }
    };
    reader.readAsDataURL(file);
}

// Report preview generation
function generateReportPreview() {
    const reportName = reportNameInput.value || taskName;
    const userName = userNameInput.value || 'Anonymous';
    const endTime = new Date();
    const timeTaken = startTime ? Math.floor((endTime - startTime) / 1000) : 0;
    const averageTime = 300;
    const hours = Math.floor(timeTaken / 3600);
    const minutes = Math.floor((timeTaken % 3600) / 60);
    const seconds = timeTaken % 60;

    let html = `
        <div class="mb-6">
            <h3 class="text-lg font-bold mb-2">${reportName}</h3>
            <p><strong>Name:</strong> ${userName}</p>
            <p><strong>Task:</strong> ${taskName || 'Untitled'}</p>
            <p><strong>Time Taken:</strong> ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}</p>
            <p><strong>Average Time:</strong> 00:05:00</p>
            <p><strong>Performance:</strong> <span class="${timeTaken <= averageTime ? 'text-green-600' : 'text-red-600'}">${timeTaken < averageTime ? 'Faster' : timeTaken > averageTime ? 'Slower' : 'Equal'} than average</span></p>
        </div>
        <div class="mb-6">
            <h3 class="text-lg font-bold mb-2">Quiz Results</h3>
            <p><strong>Score:</strong> ${quizScore}/${quizAnswers.length}</p>
            ${userQuizResponses.map(response => `
                <div class="mb-2">
                    <p><strong>${response.question}</strong></p>
                    <p>Your Answer: ${response.userAnswer}</p>
                    <p>Correct Answer: ${response.correctAnswer}</p>
                    <p>Status: <span class="${response.isCorrect ? 'text-green-600' : 'text-red-600'}">${response.isCorrect ? 'Correct' : 'Incorrect'}</span></p>
                </div>
            `).join('')}
        </div>
        <div class="mb-6">
            <h3 class="text-lg font-bold mb-2">Process Steps</h3>
            <ul class="list-decimal pl-5">
                ${steps.map((step, index) => `
                    <li>${step.Step}: ${step.Description.substring(0, 50)}${step.Description.length > 50 ? '...' : ''} (Duration: ${step.Duration}s)</li>
                `).join('')}
            </ul>
        </div>
    `;

    if (userPhoto && typeof userPhoto === 'string' && userPhoto.startsWith('data:image')) {
        html += `
            <div class="mb-6">
                <h3 class="text-lg font-bold mb-2">User Photo</h3>
                <img src="${userPhoto}" alt="User Uploaded Photo" class="max-w-full h-auto" style="max-width: 200px;">
            </div>
        `;
    } else {
        html += `
            <div class="mb-6">
                <p class="text-red-600">No photo uploaded.</p>
            </div>
        `;
    }

    reportContent.innerHTML = html;
}

// Print report
printReport.addEventListener('click', () => {
    if (!userPhoto || !photoUpload.files && !photoUploadQuiz.files) {
        alert('Please upload a photo before printing the report.');
        return;
    }
    const reportName = reportNameInput.value || taskName;
    window.print();
});

// Generative inkblot function with theme colors and symmetry
function generateInkblot() {
    const canvas = document.createElement('canvas');
    canvas.width = 2400;
    canvas.height = 1800;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Map theme to colors from styles.css gradients
    const themeColors = {
        'theme-earthy': ['#8a9a5b', '#a3b18a', '#dad7cd', '#588157'],
        'theme-architecture': ['#e0e0e0', '#a9a9a9', '#d3d3d3', '#b0c4de'],
        'theme-medieval': ['#d2b48c', '#8b4513', '#deb887', '#cd853f'],
        'theme-space': ['#1e1e2f', '#4a90e2', '#a3bffa', '#1e90ff']
    };
    const selectedTheme = designSelect.value || 'theme-earthy';
    const colors = themeColors[selectedTheme] || themeColors['theme-earthy'];
    ctx.globalAlpha = 0.3;

    for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        const startX = Math.random() * canvas.width; // Full canvas width for symmetry
        const startY = Math.random() * canvas.height;
        ctx.moveTo(startX, startY);
        
        for (let j = 0; j < 5; j++) {
            const endX = startX + (Math.random() - 0.5) * canvas.width * 0.25;
            const endY = startY + (Math.random() - 0.5) * canvas.height * 0.25;
            ctx.quadraticCurveTo(
                startX + (Math.random() - 0.5) * canvas.width * 0.15,
                startY + (Math.random() - 0.5) * canvas.height * 0.15,
                endX,
                endY
            );
        }
        ctx.lineWidth = 40 + Math.random() * 40;
        ctx.strokeStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.save();
        ctx.scale(-1, 1);
        ctx.beginPath();
        ctx.moveTo(-startX, startY);
        for (let j = 0; j < 5; j++) {
            const endX = -startX + (Math.random() - 0.5) * canvas.width * 0.25;
            const endY = startY + (Math.random() - 0.5) * canvas.height * 0.25;
            ctx.quadraticCurveTo(
                -startX + (Math.random() - 0.5) * canvas.width * 0.15,
                startY + (Math.random() - 0.5) * canvas.height * 0.15,
                endX,
                endY
            );
        }
        ctx.lineWidth = 40 + Math.random() * 40;
        ctx.strokeStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.stroke();
        ctx.restore();
    }

    ctx.imageSmoothingEnabled = false;
    return canvas.toDataURL();
}