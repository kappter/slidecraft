# SlideCraft

SlideCraft is a web-based application for creating interactive process guides with customizable themes, step-by-step presentations, quizzes, and report generation. It supports CSV uploads and asset selection for dynamic content creation.

## Version
- Current Version: 002-001-001-033 (Updated July 28, 2025)

## Features
- **Theme Customization**: Switch between light/dark modes and earthy, architecture, medieval, or space designs.
- **CSV Upload**: Import steps from a CSV file with Step, Description, Order Number, Image URL, and Duration columns.
- **Presentation Mode**: Navigate through steps with next/previous buttons or auto-advance based on CSV durations.
- **Quiz Integration**: Generate a 5-question quiz based on presentation steps, requiring a photo upload.
- **Report Generation**: Create a printable report with quiz results, time taken, and user-uploaded photos.
- **Inkblot Generation**: Display unique inkblot images when no step image is provided, with a doubled frame size (2400x1800).
- **Mobile-Friendly**: Responsive design for devices under 640px and above 641px.

## Recent Updates
- Fixed header title visibility by aligning text to the top and adjusting padding.
- Improved footer text alignment to the top with increased height (96px) and full visibility.
- Isolated quiz screen file dialog to the "Choose File" span, preventing screen-wide triggers.
- Maintained inkblot frame size at 2400x1800 for step slides.

## Setup Instructions
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/kappter/slidecraft.git
   cd slidecraft
   ```
2. **Install Dependencies**:
   - Ensure Tailwind CSS is included via `tailwind.css`.
   - No additional npm packages are required; PapaParse is loaded via CDN.
3. **Prepare Assets**:
   - Place CSV files (e.g., `sample.csv`, `wind-down-routine.csv`, `study-environment.csv`) in the `assets/` directory.
   - Include `processes.json` in `assets/` for asset selection.
   - Add `placeholder.jpg`, `favicon.ico`, and any custom images referenced in CSV Image URL columns.
4. **Run Locally**:
   - Serve the files using a local server (e.g., `python -m http.server 8000` or any static server).
   - Open `http://localhost:8000` in a browser.
5. **Deploy to GitHub Pages**:
   - Push changes to the `main` branch.
   - Enable GitHub Pages in repository settings for the `main` branch and `/ (root)` directory.
   - Access at https://kappter.github.io/slidecraft/.

## Usage Guidelines
- **Upload CSV**: Select a file or asset with the required columns to start.
- **Navigate Slides**: Use "Next" and "Previous" buttons or enable auto-advance.
- **Take Quiz**: Answer questions and upload a photo (JPEG/PNG, max 5MB) to proceed.
- **Generate Report**: Enter a report name, optional user name, and upload a photo to print.
- **Theme Switch**: Use the dropdowns in the header to adjust visibility and style.

## File Structure
- `index.html`: Main HTML structure with Tailwind CSS and custom styles.
- `styles.css`: Custom CSS for ethereal themes and responsive design.
- `main.js`: JavaScript for CSV parsing, presentation logic, quiz generation, and report creation.
- `assets/`: Contains `sample.csv`, `wind-down-routine.csv`, `study-environment.csv`, `processes.json`, `placeholder.jpg`, and `favicon.ico`.
- `tailwind.css`: Compiled Tailwind CSS file.

## Known Issues
- Ensure CSV files have all required columns to avoid errors.
- Photo uploads must be under 5MB and in JPEG/PNG format.
- Test on multiple devices to confirm responsive behavior.

## Contributing
- Fork the repository and submit pull requests with detailed descriptions.
- Report issues or suggest features via GitHub Issues.

## License
MIT License - See `LICENSE` file for details.