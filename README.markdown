# SlideCraft

SlideCraft is a web-based application designed for high school students and educators to create interactive, presentation-style process guides from a CSV file. Users can upload a CSV containing process steps, view them in a full-screen, clickable interface (optimized for phones and projectors), select from multiple themes (Light, Dark, Blue, Green), and complete a random multiple-choice quiz. The app tracks the time taken and allows users to upload a photo of their process results, generating a PDF report suitable for submission to Canvas or other learning management systems.

## Features
- **CSV Upload**: Upload a CSV file with process steps (columns: `Step`, `Description`, `Order Number`, `Image URL`).
- **Presentation Interface**: Full-screen, clickable slides displaying each step’s title, description, and image, with “Next” and “Previous” buttons and keyboard navigation (arrow keys).
- **Theme Selection**: Choose from Light, Dark, Blue, or Green themes for optimal visibility on mobile devices or projectors.
- **Time Tracking**: Tracks time from CSV upload to quiz completion, included in the PDF report.
- **Multiple-Choice Quiz**: Generates a 5-question quiz with 4 answer choices per question, based on the process steps.
- **Photo Upload**: Optionally upload a photo (JPEG/PNG, max 5MB) to include in the PDF report, showcasing the process results.
- **PDF Report**: Download a PDF with quiz results, time taken, uploaded photo, and process summary, formatted for Canvas submission.
- **Responsive Design**: Works seamlessly on desktops, phones, and projectors using Tailwind CSS.
- **Static Hosting**: Deployable on GitHub Pages with no server-side dependencies.

## Directory Structure
```
slidecraft/
├── index.html                # Main HTML file
├── css/
│   └── styles.css           # Custom theme styles
├── js/
│   ├── main.js              # Core JavaScript logic
│   ├── papaparse.min.js     # Papa Parse for CSV parsing
│   └── jspdf.umd.min.js     # jsPDF for PDF generation
├── assets/
│   ├── sample.csv           # Sample CSV file
│   ├── placeholder.jpg      # Fallback image for invalid URLs
│   └── favicon.ico          # Optional favicon
├── README.md                # This file
└── .gitignore               # Git ignore file
```

## Installation
No installation is required, as SlideCraft runs entirely in the browser. To set up locally or deploy:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/[YourUsername]/slidecraft.git
   cd slidecraft
   ```

2. **Serve Locally** (optional):
   Use a local server (e.g., Python’s HTTP server):
   ```bash
   python3 -m http.server 8000
   ```
   Open `http://localhost:8000` in your browser.

3. **Deploy to GitHub Pages**:
   - Push the repository to GitHub.
   - Enable GitHub Pages in the repository settings, selecting the `main` branch and `/ (root)` directory.
   - Access the app at `https://[YourUsername].github.io/slidecraft`.

## Usage
1. Open the app in a browser (desktop, phone, or projector).
2. Select a theme (Light, Dark, Blue, or Green) from the dropdown for optimal visibility.
3. Upload a CSV file containing process steps (see [CSV Format](#csv-format) below).
4. Click or tap to advance through the steps, or use “Previous”/“Next” buttons or arrow keys.
5. Complete the 5-question multiple-choice quiz.
6. Enter your name (optional) and upload a photo (JPEG/PNG, max 5MB) of your process results.
7. Download the PDF report, which includes your quiz score, time taken, photo, and process summary.
8. Submit the PDF to Canvas or your learning management system.

## CSV Format
The CSV file must have the following columns:
- **Step**: Brief title of the step (e.g., “Mix Ingredients”).
- **Description**: Detailed explanation of the step (e.g., “Combine flour, sugar, and eggs”).
- **Order Number**: Numeric sequence of the step (e.g., 1, 2, 3).
- **Image URL**: Publicly accessible URL to an image for the step (e.g., `https://example.com/image.jpg`).

Example (`sample.csv`):
```csv
Step,Description,Order Number,Image URL
Mix Ingredients,"Combine flour, sugar, and eggs in a bowl",1,https://example.com/mix.jpg
Bake,"Place in oven at 350°F for 30 minutes",2,https://example.com/bake.jpg
Cool,"Let cool for 10 minutes",3,https://example.com/cool.jpg
```

## Dependencies
All dependencies are loaded via CDN or included locally:
- **Tailwind CSS**: For responsive styling.
- **Papa Parse**: For CSV parsing.
- **jsPDF**: For PDF generation.

## Contributing
Contributions are welcome! Please:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/YourFeature`).
3. Commit changes (`git commit -m 'Add YourFeature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

## License
This project is licensed under the MIT License.

## Contact
For questions or feedback, open an issue on GitHub or contact [Your Contact Info].