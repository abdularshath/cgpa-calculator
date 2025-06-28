// Load saved data from localStorage
const savedData = JSON.parse(localStorage.getItem('cgpaCalculatorData')) || {
    grades: [],
    semesterData: {
        1: { totalCredits: 0, totalPoints: 0, sgpa: 0 },
        2: { totalCredits: 0, totalPoints: 0, sgpa: 0 },
        3: { totalCredits: 0, totalPoints: 0, sgpa: 0 },
        4: { totalCredits: 0, totalPoints: 0, sgpa: 0 },
        5: { totalCredits: 0, totalPoints: 0, sgpa: 0 },
        6: { totalCredits: 0, totalPoints: 0, sgpa: 0 },
        7: { totalCredits: 0, totalPoints: 0, sgpa: 0 },
        8: { totalCredits: 0, totalPoints: 0, sgpa: 0 }
    },
    studentName: ''
};

const grades = savedData.grades;
const semesterData = savedData.semesterData;

const studentNameInput = document.getElementById('studentName');
if (studentNameInput) {
    studentNameInput.value = savedData.studentName;
    studentNameInput.addEventListener('input', (e) => {
        savedData.studentName = e.target.value;
        saveData();
    });
}

const downloadBtn = document.getElementById('downloadBtn');
if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
        if (!window.isInitialized) {
            alert('PDF libraries are not initialized. Please refresh the page.');
            return;
        }

        if (!savedData.studentName) {
            alert('Please enter your name');
            return;
        }

        try {
            const doc = new window.jspdfInstance({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const colors = {
                title: '#1f3b73',
                header: '#e8ecf4',
                text: '#000000',
                background: '#ffffff',
                border: '#cccccc',
                alternate: '#f8f9fa'
            };

            const margins = {
                top: 20,
                left: 20,
                right: 20,
                width: 170
            };

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(24);
            doc.setTextColor(colors.title);
            doc.text('Academic Performance Report', 105, margins.top + 10, { align: 'center' });

            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(colors.text);
            doc.text(`Student Name: ${savedData.studentName}`, margins.left, margins.top + 25);

            const date = new Date().toLocaleDateString();
            doc.setFontSize(10);
            doc.text(`Generated on: ${date}`, margins.left, 290);

            let yPosition = margins.top + 40;

            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(colors.title);
            doc.text('Overall Performance', margins.left, yPosition);

            const cgpaElement = document.getElementById('cgpa');
            const totalCreditsElement = document.getElementById('totalCredits');
            const totalPointsElement = document.getElementById('totalPoints');

            if (!cgpaElement || !totalCreditsElement || !totalPointsElement) {
                throw new Error('Result elements not found');
            }

            doc.autoTable({
                columns: [
                    { header: 'CGPA', dataKey: 'cgpa' },
                    { header: 'Total Credits', dataKey: 'totalCredits' },
                    { header: 'Total Points', dataKey: 'totalPoints' }
                ],
                body: [{
                    cgpa: cgpaElement.textContent,
                    totalCredits: totalCreditsElement.textContent,
                    totalPoints: totalPointsElement.textContent
                }],
                startY: yPosition + 5,
                margin: { left: 20, right: 20 },
                theme: 'grid',
                styles: {
                    font: 'helvetica',
                    fontSize: 12,
                    textColor: colors.text,
                    halign: 'center'
                },
                headStyles: {
                    fillColor: colors.header,
                    textColor: colors.text,
                    fontSize: 13
                },
                alternateRowStyles: {
                    fillColor: colors.alternate
                }
            });

            yPosition = doc.lastAutoTable.finalY + 15;

            for (let sem = 1; sem <= 8; sem++) {
                const semesterGrades = grades.filter(g => g.semester === sem.toString());
                if (semesterGrades.length > 0) {
                    doc.setFontSize(14);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(colors.title);
                    doc.text(`Semester ${sem}`, margins.left, yPosition);

                    doc.autoTable({
                        columns: [
                            { header: 'Subject', dataKey: 'subject' },
                            { header: 'Grade', dataKey: 'grade' },
                            { header: 'Credit', dataKey: 'credit' },
                            { header: 'GPA', dataKey: 'gpa' },
                            { header: 'Points', dataKey: 'points' }
                        ],
                        body: semesterGrades.map(grade => ({
                            subject: grade.subject,
                            grade: grade.grade,
                            credit: grade.credit,
                            gpa: grade.gpa,
                            points: (grade.gpa * grade.credit).toFixed(2)
                        })),
                        foot: [[
                            'Total',
                            '',
                            semesterData[sem].totalCredits.toFixed(1),
                            semesterData[sem].sgpa.toFixed(2),
                            semesterData[sem].totalPoints.toFixed(2)
                        ]],
                        startY: yPosition + 5,
                        margin: { left: 20, right: 20 },
                        theme: 'grid',
                        styles: {
                            font: 'helvetica',
                            fontSize: 10,
                            textColor: colors.text,
                            halign: 'center'
                        },
                        headStyles: {
                            fillColor: colors.header,
                            textColor: colors.text,
                            fontSize: 11
                        },
                        alternateRowStyles: {
                            fillColor: colors.alternate
                        },
                        footStyles: {
                            fillColor: '#f1f1f1',
                            fontStyle: 'bold'
                        },
                        columnStyles: {
                            subject: { halign: 'left' }
                        }
                    });

                    yPosition = doc.lastAutoTable.finalY + 15;
                }
            }

            doc.save('academic-performance-report.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.\nError: ' + error.message);
        }
    });
}

function saveData() {
    localStorage.setItem('cgpaCalculatorData', JSON.stringify({
        grades: grades,
        semesterData: semesterData,
        studentName: savedData.studentName
    }));
}

function updateSemesterData() {
    for (let sem = 1; sem <= 8; sem++) {
        semesterData[sem] = { totalCredits: 0, totalPoints: 0, sgpa: 0 };
    }

    grades.forEach(grade => {
        const sem = parseInt(grade.semester);
        if (semesterData[sem]) {
            semesterData[sem].totalCredits += grade.credit;
            semesterData[sem].totalPoints += grade.gpa * grade.credit;
            if (semesterData[sem].totalCredits > 0) {
                semesterData[sem].sgpa = semesterData[sem].totalPoints / semesterData[sem].totalCredits;
            }
        }
    });

    for (let sem = 1; sem <= 8; sem++) {
        document.getElementById(`credits${sem}`).textContent = semesterData[sem].totalCredits.toFixed(1);
        document.getElementById(`points${sem}`).textContent = semesterData[sem].totalPoints.toFixed(2);
        document.getElementById(`sgpa${sem}`).textContent = semesterData[sem].sgpa.toFixed(2);
    }
}

function addGrade() {
    const subjectInput = document.getElementById('subject');
    const semesterInput = document.getElementById('semester');
    const gradeInput = document.getElementById('grade');
    const creditInput = document.getElementById('credit');

    const subject = subjectInput.value.trim();
    const semester = semesterInput.value;
    const grade = gradeInput.value;
    const credit = parseFloat(creditInput.value);

    if (!subject || semester === 'all' || isNaN(credit) || credit <= 0) {
        alert('Please fill in valid subject, semester, and credit.');
        return;
    }

    const gpa = (grade === 'O') ? 10.0 :
                (grade === 'A+') ? 9.0 :
                (grade === 'A') ? 8.0 :
                (grade === 'B+') ? 7.0 :
                (grade === 'B') ? 6.0 :
                (grade === 'C') ? 5.0 :
                (grade === 'U') ? 0.0 : 0.0;

    grades.push({ subject, semester, grade, credit, gpa });
    updateDisplay();
    saveData();

    subjectInput.value = '';
    creditInput.value = '';
}

function removeGrade(index) {
    grades.splice(index, 1);
    updateDisplay();
    saveData();
}

function updateDisplay() {
    const gradeList = document.getElementById('gradeList');
    gradeList.innerHTML = '';

    const sortedGrades = [...grades].sort((a, b) => a.semester - b.semester);

    const semesterInput = document.getElementById('semester');
    const selectedSemester = semesterInput.value;
    const filteredGrades = selectedSemester === 'all' ? sortedGrades : sortedGrades.filter(g => g.semester === selectedSemester);

    // ✅ Calculate CGPA using all grades
    let totalCredits = 0;
    let totalPoints = 0;
    grades.forEach(grade => {
        totalCredits += grade.credit;
        totalPoints += grade.gpa * grade.credit;
    });

    updateSemesterData();

    let currentSemester = null;
    filteredGrades.forEach((grade, index) => {
        if (grade.semester !== currentSemester) {
            const semesterHeading = document.createElement('div');
            semesterHeading.className = 'semester-heading';
            semesterHeading.textContent = `Semester ${grade.semester}`;
            gradeList.appendChild(semesterHeading);

            const headerRow = document.createElement('div');
            headerRow.className = 'grade-item';
            headerRow.style.fontWeight = 'bold';
            headerRow.innerHTML = `
                <span class="subject">Subject</span>
                <span class="grade">Grade</span>
                <span class="credit">Credit</span>
                <span class="gpa">GPA</span>
                <span></span>
            `;
            gradeList.appendChild(headerRow);

            currentSemester = grade.semester;
        }

        const gradeElement = document.createElement('div');
        gradeElement.className = 'grade-item';
        gradeElement.innerHTML = `
            <span class="subject">${grade.subject}</span>
            <span class="grade">${grade.grade}</span>
            <span class="credit">${grade.credit}</span>
            <span class="gpa">${grade.gpa}</span>
            <button onclick="removeGrade(${index})">Remove</button>
        `;
        gradeList.appendChild(gradeElement);
    });

    //Always display CGPA using all grades
    document.getElementById('totalCredits').textContent = totalCredits.toFixed(1);
    document.getElementById('totalPoints').textContent = totalPoints.toFixed(2);
    document.getElementById('cgpa').textContent = (totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00');
}

const semesterInput = document.getElementById('semester');
semesterInput.addEventListener('change', updateDisplay);

window.addEventListener('load', updateDisplay);
