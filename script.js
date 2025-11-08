document.addEventListener('DOMContentLoaded', () => {

    // --- THEME & SOUND --- 
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    const savedTheme = localStorage.getItem('theme') || 'dark';
    body.setAttribute('data-theme', savedTheme);
    themeToggleBtn.addEventListener('click', () => {
        playSound('click');
        const newTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    let audioCtx;
    const playSound = (type) => {
        if (!audioCtx) return;
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        g.connect(audioCtx.destination);
        o.connect(g);
        const now = audioCtx.currentTime;
        g.gain.setValueAtTime(0, now);
        switch (type) {
            case 'click':
                o.type = 'triangle';
                o.frequency.setValueAtTime(440, now);
                g.gain.setValueAtTime(0.3, now);
                g.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
                break;
            case 'switch':
                o.type = 'sine';
                o.frequency.setValueAtTime(300, now);
                o.frequency.exponentialRampToValueAtTime(600, now + 0.1);
                g.gain.setValueAtTime(0.2, now);
                g.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
                break;
            case 'add':
                o.type = 'sine';
                o.frequency.setValueAtTime(523.25, now);
                g.gain.setValueAtTime(0.2, now);
                g.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
                break;
            case 'remove':
                o.type = 'triangle';
                o.frequency.setValueAtTime(220, now);
                g.gain.setValueAtTime(0.2, now);
                g.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
                break;
        }
        o.start(now);
        o.stop(now + 0.2);
    };
    document.body.addEventListener('click', () => { if (!audioCtx) { audioCtx = new(window.AudioContext || window.webkitAudioContext)(); } }, { once: true });

    // --- NAVIGATION --- 
    const navBar = document.querySelector('.nav-bar');
    const navItems = document.querySelectorAll('.nav-item');
    const mainContent = document.querySelector('.content');
    const sections = Array.from(document.querySelectorAll('.calculator-section'));
    const highlighter = document.querySelector('.highlighter');
    let activeSection = sections[0];
    let currentIndex = 0;

    const updateContainerHeight = () => { requestAnimationFrame(() => { if (activeSection) mainContent.style.height = `${activeSection.offsetHeight}px`; }); };
    const moveHighlighter = (target) => {
        if (!target) return;
        const targetRect = target.getBoundingClientRect();
        const navBarRect = navBar.getBoundingClientRect();
        highlighter.style.width = `${targetRect.width}px`;
        highlighter.style.height = `${targetRect.height}px`;
        highlighter.style.transform = `translate(${targetRect.left - navBarRect.left}px, ${targetRect.top - navBarRect.top}px)`;
    };

    const staggerCards = (container) => {
        const cards = container.querySelectorAll('.subject-card, .semester-card');
        cards.forEach((card, index) => { card.style.animationDelay = `${index * 60}ms`; });
    };

    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.pointerEvents = 'none';
        section.style.transform = 'translateX(30px)';
        if (index === 0) {
            section.style.opacity = '1';
            section.style.pointerEvents = 'auto';
            section.style.transform = 'translateX(0)';
            staggerCards(section);
        }
    });

    navItems.forEach((item, targetIndex) => {
        item.addEventListener('click', () => {
            if (targetIndex === currentIndex) return;
            playSound('switch');
            const isMovingForward = targetIndex > currentIndex;
            const targetSection = sections[targetIndex];
            moveHighlighter(item);
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            activeSection.style.opacity = '0';
            activeSection.style.pointerEvents = 'none';
            activeSection.style.transform = isMovingForward ? 'translateX(-30px)' : 'translateX(30px)';
            targetSection.style.transform = isMovingForward ? 'translateX(30px)' : 'translateX(-30px)';
            mainContent.style.height = `${targetSection.offsetHeight}px`;
            requestAnimationFrame(() => {
                targetSection.style.opacity = '1';
                targetSection.style.pointerEvents = 'auto';
                targetSection.style.transform = 'translateX(0)';
                staggerCards(targetSection);
            });
            activeSection = targetSection;
            currentIndex = targetIndex;
        });
    });

    window.addEventListener('resize', () => {
        moveHighlighter(document.querySelector('.nav-item.active'));
        updateContainerHeight();
    });

    window.addEventListener('load', () => {
        moveHighlighter(document.querySelector('.nav-item.active'));
        updateContainerHeight();
    });

    // --- UTILITY FUNCTIONS --- 
    const getGradePoints = (marks) => {
        if (marks >= 90) return 10;
        if (marks >= 80) return 9;
        if (marks >= 70) return 8;
        if (marks >= 60) return 7;
        if (marks >= 50) return 6;
        if (marks >= 40) return 4;
        return 0;
    };

    let heightUpdaterTimeout;
    const heightUpdater = () => {
        clearTimeout(heightUpdaterTimeout);
        heightUpdaterTimeout = setTimeout(updateContainerHeight, 50);
    };

    const animateCountUp = (element, endValue) => {
        let startValue = 0;
        const duration = 500;
        const frameDuration = 1000 / 60;
        const totalFrames = Math.round(duration / frameDuration);
        let frame = 0;
        const counter = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            const currentValue = startValue + (endValue - startValue) * (1 - Math.pow(1 - progress, 3)); // easeOutCubic
            element.textContent = currentValue.toFixed(2);
            if (frame === totalFrames) {
                clearInterval(counter);
                element.textContent = endValue.toFixed(2);
            }
        }, frameDuration);
    };

    // --- VALIDATION --- 
    const showError = (errorDiv, message) => {
        if (errorDiv.dataset.timeoutId) {
            clearTimeout(errorDiv.dataset.timeoutId);
        }
        errorDiv.textContent = message;
        errorDiv.style.display = "block";
        errorDiv.dataset.timeoutId = setTimeout(() => {
            errorDiv.style.display = "none";
        }, 2500);
    };

    const validateInput = (input, rules, errorDiv) => {
        const value = parseFloat(input.value);
        if (isNaN(value)) {
            showError(errorDiv, 'Please enter a valid number.');
            return false;
        }
        if (value < rules.min) {
            showError(errorDiv, `Value cannot be less than ${rules.min}.`);
            input.value = rules.min;
            return false;
        }
        if (value > rules.max) {
            showError(errorDiv, `Value cannot be more than ${rules.max}.`);
            input.value = rules.max;
            return false;
        }
        errorDiv.style.display = "none";
        return true;
    };

    const checkFormValidity = (sectionId) => {
        const section = document.getElementById(sectionId);
        const inputs = section.querySelectorAll('input[type="number"]');
        const calcBtn = section.querySelector('.calculate-btn');
        let allValid = true;
        for (const input of inputs) {
            if (input.value.trim() === '') {
                allValid = false;
                break;
            }
        }
        calcBtn.disabled = !allValid;
    };

    // --- SGPA Logic --- 
    const sgpaSubjectsContainer = document.getElementById('sgpa-subjects');
    const addSubjectBtn = document.querySelector('#sgpa-page .add-subject-btn');
    const sgpaCalcBtn = document.querySelector('.calculate-btn[data-calc="sgpa"]');
    const sgpaResultSpan = document.getElementById('sgpa-result');
    const clearSgpaBtn = document.querySelector('.clear-btn[data-clear="sgpa"]');

    const updateSubjectLabels = () => { document.querySelectorAll('#sgpa-subjects .subject-card').forEach((card, index) => { card.querySelector('.subject-label').textContent = `Subject ${index + 1}`; }); };

    addSubjectBtn.addEventListener('click', () => {
        playSound('add');
        const newCard = document.createElement('div');
        newCard.classList.add('subject-card');
        newCard.innerHTML = `<div class="subject-card-header"><span class="subject-label">Subject X</span><button class="remove-btn">&times;</button></div><div class="subject-inputs"><input type="number" class="credits-input" placeholder="Credits" min="0"><input type="number" class="marks-input" placeholder="Marks (0-100)" min="0"></div><div class="error-message credits-error"></div><div class="error-message marks-error"></div>`;
        sgpaSubjectsContainer.appendChild(newCard);
        updateSubjectLabels();
        heightUpdater();
        checkFormValidity('sgpa-page');
    });

    sgpaSubjectsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-btn')) {
            playSound('remove');
            const card = event.target.closest('.subject-card');
            card.style.maxHeight = `${card.offsetHeight}px`;
            requestAnimationFrame(() => card.classList.add('card-exiting'));
            card.addEventListener('animationend', () => { 
                card.remove(); 
                updateSubjectLabels(); 
                heightUpdater(); 
                checkFormValidity('sgpa-page');
            }, { once: true });
        }
    });

    sgpaSubjectsContainer.addEventListener('input', (event) => {
        const target = event.target;
        const card = target.closest('.subject-card');
        if (target.classList.contains('credits-input')) {
            validateInput(target, { min: 0, max: 4 }, card.querySelector('.credits-error'));
        }
        if (target.classList.contains('marks-input')) {
            validateInput(target, { min: 0, max: 100 }, card.querySelector('.marks-error'));
        }
        checkFormValidity('sgpa-page');
    });

    sgpaCalcBtn.addEventListener('click', () => {
        playSound('click');
        const cards = document.querySelectorAll('#sgpa-subjects .subject-card');
        let totalCredits = 0, totalGradePoints = 0;
        cards.forEach(card => {
            const credits = parseFloat(card.querySelector('.credits-input').value);
            const marks = parseFloat(card.querySelector('.marks-input').value);
            totalCredits += credits;
            totalGradePoints += credits * getGradePoints(marks);
        });
        const finalSgpa = totalCredits > 0 ? (totalGradePoints / totalCredits) : 0;
        animateCountUp(sgpaResultSpan, finalSgpa);
        document.querySelector('.print-btn[data-print="sgpa"]').style.cssText = 'display: block; margin: 15px auto 0;';
        heightUpdater();
    });

    clearSgpaBtn.addEventListener('click', () => {
        playSound('click');
        document.querySelectorAll('#sgpa-subjects .subject-card').forEach(card => {
            card.querySelector('.credits-input').value = '';
            card.querySelector('.marks-input').value = '';
        });
        sgpaResultSpan.textContent = '';
        document.querySelector('.print-btn[data-print="sgpa"]').style.display = 'none';
        checkFormValidity('sgpa-page');
        heightUpdater();
    });

    sgpaSubjectsContainer.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); sgpaCalcBtn.click(); } });

    // --- CGPA Logic --- 
    const cgpaSemestersContainer = document.getElementById('cgpa-semesters');
    const addSemesterBtn = document.getElementById('add-semester-btn');
    const cgpaCalcBtn = document.querySelector('.calculate-btn[data-calc="cgpa"]');
    const cgpaResultSpan = document.getElementById('cgpa-result');
    const clearCgpaBtn = document.querySelector('.clear-btn[data-clear="cgpa"]');
    const updateSemesterLabels = () => { document.querySelectorAll('#cgpa-semesters .semester-card').forEach((card, index) => { card.querySelector('.semester-label').textContent = `Semester ${index + 1}`; }); };
    
    const checkSemesterCount = () => {
        const cards = document.querySelectorAll('#cgpa-semesters .semester-card');
        addSemesterBtn.style.display = (cards.length >= 8) ? 'none' : 'block';
    };

    addSemesterBtn.addEventListener('click', () => {
        playSound('add');
        const newCard = document.createElement('div');
        newCard.classList.add('semester-card');
        newCard.innerHTML = `<div class="subject-card-header"><span class="semester-label">Semester X</span><button class="remove-btn">&times;</button></div><div class="semester-inputs"><input type="number" class="sgpa-input" placeholder="SGPA" step="0.01" min="0" max="10"></div><div class="error-message sgpa-error"></div>`;
        cgpaSemestersContainer.appendChild(newCard);
        updateSemesterLabels();
        heightUpdater();
        checkSemesterCount();
        checkFormValidity('cgpa-page');
    });

    cgpaSemestersContainer.addEventListener('input', (event) => {
        const target = event.target;
        if (target.classList.contains('sgpa-input')) {
            const card = target.closest('.semester-card');
            validateInput(target, { min: 0, max: 10 }, card.querySelector('.sgpa-error'));
        }
        checkFormValidity('cgpa-page');
    });

    cgpaSemestersContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-btn')) {
            playSound('remove');
            const card = event.target.closest('.semester-card');
            card.style.maxHeight = `${card.offsetHeight}px`;
            requestAnimationFrame(() => card.classList.add('card-exiting'));
            card.addEventListener('animationend', () => {
                card.remove();
                updateSemesterLabels();
                heightUpdater();
                checkSemesterCount();
                checkFormValidity('cgpa-page');
            }, { once: true });
        }
    });

    cgpaCalcBtn.addEventListener('click', () => {
        playSound('click');
        const cards = document.querySelectorAll('#cgpa-semesters .semester-card');
        let totalSgpa = 0;
        const sgpaValues = [];
        cards.forEach(card => {
            const sgpa = parseFloat(card.querySelector('.sgpa-input').value);
            totalSgpa += sgpa;
            sgpaValues.push(sgpa);
        });
        const finalCgpa = cards.length > 0 ? (totalSgpa / cards.length) : 0;
        animateCountUp(cgpaResultSpan, finalCgpa);
    });

    clearCgpaBtn.addEventListener('click', () => {
        playSound('click');
        document.querySelectorAll('#cgpa-semesters .semester-card').forEach(card => {
            card.querySelector('.sgpa-input').value = '';
        });
        cgpaResultSpan.textContent = '';
        checkFormValidity('cgpa-page');
    });

    cgpaSemestersContainer.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); cgpaCalcBtn.click(); } });

    // --- Percentage Logic --- 
    const percentageCalcBtn = document.querySelector('.calculate-btn[data-calc="percentage"]');
    const percentageResultSpan = document.getElementById('percentage-result');
    const clearPercentageBtn = document.querySelector('.clear-btn[data-clear="percentage"]');
    const cgpaToConvertInput = document.getElementById('cgpa-to-convert');

    cgpaToConvertInput.addEventListener('input', () => {
        validateInput(cgpaToConvertInput, { min: 0, max: 10 }, document.querySelector('.cgpa-convert-error'));
        checkFormValidity('percentage-page');
    });

    percentageCalcBtn.addEventListener('click', () => {
        playSound('click');
        const cgpa = parseFloat(cgpaToConvertInput.value);
        const finalPercentage = (cgpa - 0.75) * 10;
        animateCountUp(percentageResultSpan, finalPercentage);
    });

    clearPercentageBtn.addEventListener('click', () => {
        playSound('click');
        cgpaToConvertInput.value = '';
        percentageResultSpan.textContent = '';
        checkFormValidity('percentage-page');
    });

    cgpaToConvertInput.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); percentageCalcBtn.click(); } });

    // --- Print Logic --- 
    const printBtn = document.querySelector('.print-btn[data-print="sgpa"]');
    const printModal = document.getElementById('print-modal');
    const closeModalBtn = printModal.querySelector('.close-btn');
    const creditWiseBtn = document.getElementById('credit-wise-btn');
    const subjectWiseBtn = document.getElementById('subject-wise-btn');
    const subjectNamesContainer = document.getElementById('subject-names-container');
    const confirmPrintBtn = document.getElementById('confirm-print-btn');
    const printOutput = document.getElementById('print-output');
    const studentNameInput = document.getElementById('student-name');
    const studentUsnInput = document.getElementById('student-usn');

    let printType = '';

    const movePrintHighlighter = (target) => {
        if (!target) return;
        const highlighter = document.querySelector('.print-options .highlighter');
        const targetRect = target.getBoundingClientRect();
        const parentRect = document.querySelector('.print-options').getBoundingClientRect();
        highlighter.style.width = `${targetRect.width}px`;
        highlighter.style.height = `${targetRect.height}px`;
        highlighter.style.transform = `translate(${targetRect.left - parentRect.left}px, ${targetRect.top - parentRect.top}px)`;
    };

    printBtn.addEventListener('click', () => {
        printModal.style.display = 'block';
        creditWiseBtn.classList.remove('active');
        subjectWiseBtn.classList.remove('active');
        subjectNamesContainer.style.display = 'none';
        confirmPrintBtn.style.display = 'none';
        const highlighter = document.querySelector('.print-options .highlighter');
        highlighter.style.width = '0px';
    });

    closeModalBtn.addEventListener('click', () => { printModal.style.display = 'none'; });
    window.addEventListener('click', (event) => { if (event.target === printModal) { printModal.style.display = 'none'; } });

    creditWiseBtn.addEventListener('click', () => {
        printType = 'credit-wise';
        subjectNamesContainer.style.display = 'none';
        creditWiseBtn.classList.add('active');
        subjectWiseBtn.classList.remove('active');
        confirmPrintBtn.style.display = 'block';
        movePrintHighlighter(creditWiseBtn);
    });

    subjectWiseBtn.addEventListener('click', () => {
        printType = 'subject-wise';
        subjectNamesContainer.style.display = 'block';
        subjectWiseBtn.classList.add('active');
        creditWiseBtn.classList.remove('active');
        populateSubjectNameInputs();
        confirmPrintBtn.style.display = 'block';
        movePrintHighlighter(subjectWiseBtn);
    });

    function populateSubjectNameInputs() {
        subjectNamesContainer.innerHTML = '<h3>Enter Subject Names</h3>';
        const subjectCards = document.querySelectorAll('#sgpa-subjects .subject-card');
        subjectCards.forEach((card, index) => {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Subject ${index + 1} Name`;
            input.dataset.index = index;
            subjectNamesContainer.appendChild(input);
        });
    }

    confirmPrintBtn.addEventListener('click', () => {
        generatePrintContent();
        window.print();
        printModal.style.display = 'none';
    });

    function generatePrintContent() {
        const sgpaResult = document.getElementById('sgpa-result').textContent;
        const studentName = studentNameInput.value || 'N/A';
        const studentUsn = studentUsnInput.value || 'N/A';

        if (!sgpaResult) {
            printOutput.innerHTML = '<h2>Please calculate the result first.</h2>';
            return;
        }

        let content = `<h1>VTU Result</h1><p><strong>Name:</strong> ${studentName}</p><p><strong>USN:</strong> ${studentUsn}</p>`;
        let totalMarks = 0;
        let totalCredits = 0;

        if (printType === 'credit-wise') {
            content += '<table><thead><tr><th>Credits</th><th>Marks</th></tr></thead><tbody>';
            const subjectCards = document.querySelectorAll('#sgpa-subjects .subject-card');
            subjectCards.forEach(card => {
                const credits = card.querySelector('.credits-input').value;
                const marks = card.querySelector('.marks-input').value;
                if (credits && marks) {
                    content += `<tr><td>${credits}</td><td>${marks}</td></tr>`;
                    totalCredits += parseFloat(credits) || 0;
                    totalMarks += parseFloat(marks) || 0;
                }
            });
            content += '</tbody></table>';
        } else if (printType === 'subject-wise') {
            content += '<table><thead><tr><th>Subject</th><th>Credits</th><th>Marks</th></tr></thead><tbody>';
            const subjectCards = document.querySelectorAll('#sgpa-subjects .subject-card');
            const subjectNameInputs = subjectNamesContainer.querySelectorAll('input');
            subjectCards.forEach((card, index) => {
                const credits = card.querySelector('.credits-input').value;
                const marks = card.querySelector('.marks-input').value;
                if (credits && marks) {
                    const subjectName = subjectNameInputs[index].value || `Subject ${index + 1}`;
                    content += `<tr><td>${subjectName}</td><td>${credits}</td><td>${marks}</td></tr>`;
                    totalCredits += parseFloat(credits) || 0;
                    totalMarks += parseFloat(marks) || 0;
                }
            });
            content += '</tbody></table>';
        }

        const percentage = totalCredits > 0 ? ((totalMarks / (document.querySelectorAll('#sgpa-subjects .subject-card').length * 100)) * 100).toFixed(2) : 0;
        content += `<h2>Total Credits: ${totalCredits}</h2>`;
        content += `<h2>Percentage: ${percentage}%</h2>`;
        content += `<h2>Final SGPA: ${sgpaResult}</h2>`;

        printOutput.innerHTML = content;
    }

    

    // Initial check for all forms
    checkFormValidity('sgpa-page');
    checkFormValidity('cgpa-page');
    checkFormValidity('percentage-page');
});