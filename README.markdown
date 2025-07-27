# SlideCraft

SlideCraft is a web-based application designed for high school students and educators to create interactive, presentation-style process guides from a CSV file. Users can upload a CSV containing process steps, select from predefined processes, view them in a full-screen, clickable interface (optimized for phones and projectors), choose between Light and Dark themes, and complete a random multiple-choice quiz. The app tracks the time taken and allows users to upload a photo of their process results, generating a report that can be viewed in the browser and printed or saved as a PDF.

## Features
- **CSV Upload**: Upload a CSV file with process steps (columns: `Step`, `Description`, `Order Number`, `Image URL`, `Duration`).
- **Predefined Processes**: Select from a list of built-in processes stored in `assets/` via a dropdown, including Peanut Butter Sandwich, Wind Down Routine, and Study Environment.
- **Presentation Interface**: Full-screen, clickable slides displaying each step’s title, description, and image, with “Next” and “Previous” buttons, keyboard navigation (arrow keys), and optional auto-advance based on duration. Shows elapsed time vs. average time in the footer and step number out of total.
- **Theme Selection**: Choose from Light or Dark themes for optimal visibility on mobile devices or projectors.
- **Time Tracking**: Tracks time from CSV upload to quiz completion, included in the report.
- **Multiple-Choice Quiz**: Generates a 5-question quiz with 4 answer choices per question, based on the process steps, with no auto-advance.
- **Photo Upload**: Users must upload a photo (JPEG/PNG, max 5MB) to include in the report, showcasing the process results.
- **Report Naming**: Users must specify a custom report name, which is displayed in the report and used as a suggestion for the saved PDF file.
- **Report Preview**: Displays a scrollable report in the browser with user info, quiz results, process steps, and uploaded photo, allowing users to enter their name, name their report, and upload a photo before printing or saving as PDF using the browser’s native functionality.
- **Responsive Design**: Works seamlessly on desktops, phones, and projectors using Tailwind CSS with a fixed, ultra-compact header and footer, featuring a super clean and professional look.
- **Static Hosting**: Deployable on GitHub Pages with no server-side dependencies.

## Directory Structure
```
slidecraft/
├── index.html                # Main HTML file
├── main.js                   # Core JavaScript logic
├── styles.css                # Custom theme styles
├── tailwind.css             # Compiled Tailwind CSS
├── assets/
│   ├── sample.csv           # Sample CSV file
│   ├── wind-down-routine.csv # Wind Down Routine process
│   ├── study-environment.csv # Study Environment process
│   ├── placeholder.jpg      # Fallback image for invalid URLs
│   ├── favicon.ico          # Favicon
│   ├── processes.json       # List of available process CSVs
├── README.md                # This file
└── .gitignore               # Git ignore file
```

## Installation
No installation is required, as SlideCraft runs entirely in the browser. To set up locally or deploy:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/kappter/slidecraft.git
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
   - Access the app at `https://kappter.github.io/slidecraft`.

## Usage
1. Open the app in a browser (desktop, phone, or projector).
2. Select a theme (Light or Dark) from the fixed header dropdown for optimal visibility.
3. Choose a predefined process from the "Select Asset" dropdown or upload a custom CSV file containing process steps (see [CSV Format](#csv-format) below).
4. Check 'Auto-Advance' to move slides automatically based on the Duration column (default 5 seconds).
5. Click 'Start' to begin the guided process.
6. Complete the 5-question multiple-choice quiz.
7. View the report preview, enter a report name, your name, and upload a photo (JPEG/PNG, max 5MB) of your process results.
8. Click "Print Report" to print or save it as a PDF using your browser.
9. Submit the printed or saved PDF to Canvas or your learning management system.

## CSV Format
The CSV file must have the following columns:
- **Step**: Brief title of the step (e.g., “Mix Ingredients”).
- **Description**: Detailed explanation of the step (e.g., “Combine flour, sugar, and eggs”).
- **Order Number**: Numeric sequence of the step (e.g., 1, 2, 3).
- **Image URL**: Publicly accessible URL to an image for the step (e.g., `https://example.com/image.jpg`).
- **Duration**: Time in seconds for each step (e.g., 5, 10). Defaults to 5 if not specified.

Example (`sample.csv`):
```csv
Step,Description,Order Number,Image URL,Duration
Mix Ingredients,"Combine flour, sugar, and eggs in a bowl",1,https://example.com/mix.jpg,5
Bake,"Place in oven at 350°F for 30 minutes",2,https://example.com/bake.jpg,10
Cool,"Let cool for 10 minutes",3,https://example.com/cool.jpg,5
```

## Dependencies
All dependencies are loaded via CDN or included locally:
- **Tailwind CSS**: Compiled locally in `tailwind.css` for styling.
- **Papa Parse**: For CSV parsing (via CDN).

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
For questions or feedback, open an issue on GitHub.