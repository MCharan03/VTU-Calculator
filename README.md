# VTU Based Calculator

This is a simple web-based calculator for VTU students to calculate their SGPA, CGPA, and percentage.

## Features

*   **SGPA Calculator:** Calculate your Semester Grade Point Average (SGPA) by entering your marks and credits for each subject.
*   **CGPA Calculator:** Calculate your Cumulative Grade Point Average (CGPA) by entering your SGPA for each semester.
*   **Percentage Converter:** Convert your CGPA to a percentage.
*   **Print Results:** Print your SGPA results with subject-wise or credit-wise details.
*   **Dark/Light Theme:** Switch between dark and light themes for a comfortable user experience.
*   **Responsive Design:** The calculator is designed to work on all devices, including desktops, tablets, and mobile phones.

## Software Requirements

*   A modern web browser that supports HTML5, CSS3, and JavaScript.

## Setup and Configuration

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mallela-vihar/VTU-based-Calculator.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd VTU-based-Calculator
    ```
3.  **Open the `index.html` file in your web browser.**

## How it Works

The VTU Based Calculator is a simple web application built with HTML, CSS, and JavaScript.

*   **`index.html`:** This file contains the structure of the web page, including the input fields, buttons, and result display areas.
*   **`style.css`:** This file contains the styles for the web page, including the layout, colors, and fonts. It also includes a dark and light theme.
*   **`script.js`:** This file contains the JavaScript code that powers the calculator. It handles user input, performs the calculations, and updates the display.

The calculator uses the following formulas:

*   **SGPA:** `(Σ(Credits * Grade Points)) / (Σ(Credits))`
*   **CGPA:** `(Σ(SGPA)) / (Number of Semesters)`
*   **Percentage:** `(CGPA - 0.75) * 10`

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.