// State
let steps = [];
let currentStep = 0;
let startTime = null;

console.log('Script loaded at', new Date().toLocaleTimeString());

// DOM elements with fallback check
const uploadScreen = document.getElementById('upload-screen') || console.error('upload-screen not found');
const presentationScreen = document.getElementById('presentation-screen') || console.error('presentation-screen not found');
const reportScreen = document.getElementById('report-screen') || console.error('report-screen not found');
const csvUpload = document.getElementById('csv-upload') || console.error('csv-upload not found');
const startButton = document.getElementById('start-button') || console.error('start-button not found');
const themeSelect = document.getElementById('theme-select') || console.error('theme-select not found');
const errorMessage = document.getElementById('error-message') || console.error('error-message not found');
const stepTitle = document.getElementById('step-title') || console.error('step-title not found');
const stepDescription = document.getElementById('step-description') || console.error('step-description not found');
const prevButton = document.getElementById('prev-button') || console.error('prev-button not found');
const nextButton = document.getElementById('next-button') || console.error('next-button not found');
const userNameInput = document.getElementById('user-name') || console.error('user-name not found');
const generateReport = document.getElementById('generate-report') || console.error('generate-report not found');

console.log('DOM elements checked:', { csvUpload, startButton });

// Theme switching
themeSelect.addEventListener('change', () => {
    document.body.className = `${themeSelect.value} min-h-screen flex items-center justify-center`;
    console.log('Theme changed to', themeSelect.value);
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
            const requiredFields = ['Step', 'Description', 'Order Number'];
            if (!result.meta.fields || !requiredFields.every(field => result.meta.fields.includes(field))) {
                errorMessage.textContent = 'Invalid CSV: Needs Step, Description, Order Number.';
                console.log('Invalid CSV fields:', result.meta.fields);
                return;
            }
            steps = result.data.sort((a, b) => Number(a['Order Number']) - Number(b['Order Number']));
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
    prevButton.classList.toggle('hidden', index === 0);
    nextButton.textContent = index === steps.length - 1 ? 'Finish' : 'Next';
}

prevButton.addEventListener('click', () => {
    console.log('Previous button clicked');
    showStep(currentStep - 1);
});
nextButton.addEventListener('click', () => {
    console.log('Next button clicked');
    if (currentStep === steps.length - 1) {
        presentationScreen.classList.add('hidden');
        reportScreen.classList.remove('hidden');
    } else {
        showStep(currentStep + 1);
    }
});

// Report generation
generateReport.addEventListener('click', () => {
    console.log('Generate report clicked');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const userName = userNameInput.value || 'Anonymous';
    const endTime = new Date();
    const timeTaken = Math.floor((endTime - startTime) / 1000);

    doc.setFontSize(16);
    doc.text(`SlideCraft Report - ${userName}`, 10, 10);
    doc.text(`Time Taken: ${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`, 10, 20);
    doc.text('Steps:', 10, 30);
    steps.forEach((step, index) => {
        doc.text(`${index + 1}. ${step.Step}: ${step.Description}`, 10, 40 + index * 10);
    });

    doc.save(`Report_${userName}.pdf`);
});
