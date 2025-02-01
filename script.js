document.addEventListener('DOMContentLoaded', function () {
    // 1. VARIÁVEIS GLOBAIS
    const resumeForm = document.getElementById('resumeForm');
    const photoInput = document.getElementById('photo');
    const resumePreview = document.getElementById('resumePreview');
    const progressBar = document.getElementById('progressBar'); // Barra de progresso
    const progressText = document.getElementById('progressText'); // Texto do progresso
    const fields = Array.from(resumeForm.querySelectorAll('input, textarea, select'));
    const downloadPdfBtn = document.getElementById('downloadPdf');
    const downloadWordBtn = document.getElementById('downloadWord');

    // 2. EVENTOS DINÂMICOS PARA ADIÇÃO DE CAMPOS

    // Adicionar Experiência
    document.getElementById('addExperience').addEventListener('click', function () {
        const experienceContainer = document.getElementById('experienceContainer');
        const newEntry = document.createElement('div');
        newEntry.classList.add('experience-entry');
        newEntry.innerHTML = `
            <input type="text" class="experience-title" placeholder="Cargo">
            <input type="text" class="experience-company" placeholder="Empresa">
            <input type="text" class="experience-duration" placeholder="Data de Início - Data de Término">
            <textarea class="experience-description" placeholder="Descrição breve"></textarea>
            <button type="button" class="remove-button">Remover</button>
        `;
        experienceContainer.appendChild(newEntry);
        newEntry.querySelector('.remove-button').addEventListener('click', function () {
            experienceContainer.removeChild(newEntry);
        });
    });

    // Adicionar Educação
    document.getElementById('addEducation').addEventListener('click', function () {
        const educationContainer = document.getElementById('educationContainer');
        const newEntry = document.createElement('div');
        newEntry.classList.add('education-entry');
        newEntry.innerHTML = `
            <input type="text" class="education-title" placeholder="Nome do Curso">
            <input type="text" class="education-institution" placeholder="Instituição">
            <input type="text" class="education-duration" placeholder="Data de Início - Data de Conclusão">
            <button type="button" class="remove-button">Remover</button>
        `;
        educationContainer.appendChild(newEntry);
        newEntry.querySelector('.remove-button').addEventListener('click', function () {
            educationContainer.removeChild(newEntry);
        });
    });

    // Adicionar Certificação
    document.getElementById('addCertification').addEventListener('click', function () {
        const certificationsContainer = document.getElementById('certificationsContainer');
        const newEntry = document.createElement('div');
        newEntry.classList.add('certification-entry');
        newEntry.innerHTML = `
            <input type="text" class="certification-name" placeholder="Nome da Certificação">
            <input type="text" class="certification-institution" placeholder="Instituição">
            <textarea class="certification-description" placeholder="Descrição breve"></textarea>
            <button type="button" class="remove-button">Remover</button>
        `;
        certificationsContainer.appendChild(newEntry);
        newEntry.querySelector('.remove-button').addEventListener('click', function () {
            certificationsContainer.removeChild(newEntry);
        });
    });

    // 3. FUNÇÕES AUXILIARES

    // Atualiza a barra de progresso
    function updateProgress() {
        const totalFields = fields.length;
        let filledFields = 0;
        fields.forEach(field => {
            if (field.type === 'file' && field.files && field.files.length > 0) {
                filledFields++;
            } else if (field.value.trim() !== '') {
                filledFields++;
            }
        });
        const progress = Math.min(100, Math.round((filledFields / totalFields) * 100));
        progressBar.value = progress;
        progressText.textContent = `${progress}%`;
    }

    // Formatação de telefone
    function formatPhone(phoneInput) {
        phoneInput.addEventListener('input', () => {
            let phoneValue = phoneInput.value.replace(/\D/g, '');
            if (phoneValue.length > 11) phoneValue = phoneValue.slice(0, 11);
            if (phoneValue.length === 11) {
                phoneInput.value = `(${phoneValue.slice(0, 2)}) ${phoneValue.slice(2, 7)}-${phoneValue.slice(7, 11)}`;
            } else if (phoneValue.length > 6) {
                phoneInput.value = `(${phoneValue.slice(0, 2)}) ${phoneValue.slice(2, 6)}-${phoneValue.slice(6)}`;
            } else if (phoneValue.length > 2) {
                phoneInput.value = `(${phoneValue.slice(0, 2)}) ${phoneValue.slice(2)}`;
            }
        });
    }
    formatPhone(document.getElementById('phone1'));
    formatPhone(document.getElementById('phone2'));

    // Contador do resumo
    const summaryField = document.getElementById('summary');
    const summaryCounter = document.getElementById('summaryCounter');
    summaryField.addEventListener('input', function () {
        const maxLength = 500;
        if (this.value.length > maxLength) {
            this.value = this.value.substring(0, maxLength);
        }
        summaryCounter.textContent = `${this.value.length} / ${maxLength} caracteres`;
    });

    // 4. FUNÇÃO PARA GERAR O CURRÍCULO
    function generateResume() {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone1 = document.getElementById('phone1').value;
        if (!name || !email || !phone1) {
            alert("Por favor, preencha os campos obrigatórios.");
            return;
        }
        // Coleta de dados de habilidades e idiomas
        const skills = document.getElementById('skills').value.split(',').map(s => s.trim()).filter(s => s);
        const languages = document.getElementById('languages').value.split(',').map(l => l.trim()).filter(l => l);

        // Coleta de entradas dinâmicas (Educação, Experiência e Certificações)
        const educationEntries = document.querySelectorAll('.education-entry');
        const educationData = Array.from(educationEntries).map(entry => ({
            title: entry.querySelector('.education-title') ? entry.querySelector('.education-title').value : '',
            institution: entry.querySelector('.education-institution') ? entry.querySelector('.education-institution').value : '',
            duration: entry.querySelector('.education-duration') ? entry.querySelector('.education-duration').value : ''
        }));

        const experienceEntries = document.querySelectorAll('.experience-entry');
        const experienceData = Array.from(experienceEntries).map(entry => ({
            title: entry.querySelector('.experience-title') ? entry.querySelector('.experience-title').value : '',
            company: entry.querySelector('.experience-company') ? entry.querySelector('.experience-company').value : '',
            duration: entry.querySelector('.experience-duration') ? entry.querySelector('.experience-duration').value : '',
            description: entry.querySelector('.experience-description') ? entry.querySelector('.experience-description').value : ''
        }));

        const certificationEntries = document.querySelectorAll('.certification-entry');
        const certificationData = Array.from(certificationEntries).map(entry => ({
            name: entry.querySelector('.certification-name') ? entry.querySelector('.certification-name').value : '',
            institution: entry.querySelector('.certification-institution') ? entry.querySelector('.certification-institution').value : '',
            description: entry.querySelector('.certification-description') ? entry.querySelector('.certification-description').value : ''
        }));

        const resumeData = {
            name: name,
            address: document.getElementById('address').value,
            phone1: phone1,
            phone2: document.getElementById('phone2').value,
            email: email,
            linkedin: document.getElementById('linkedin').value,
            summary: summaryField.value,
            skills: skills,
            languages: languages,
            education: educationData,
            experience: experienceData,
            certifications: certificationData,
            activities: document.getElementById('activities').value,
            photo: photoInput.files.length > 0 ? URL.createObjectURL(photoInput.files[0]) : ''
        };

        resumePreview.style.opacity = "0";
        resumePreview.style.display = "flex";
        setTimeout(() => {
            displayResumePreview(resumeData);
            resumePreview.style.opacity = "1";
            resumePreview.style.transition = "opacity 0.5s ease-in-out";
        }, 100);
    }

    // 5. FUNÇÃO PARA EXIBIR A PRÉ-VISUALIZAÇÃO
    function displayResumePreview(data) {
        const skillsHTML = data.skills.length 
            ? `<h3>Habilidades</h3><ul>${data.skills.map(skill => `<li>${skill}</li>`).join('')}</ul>` 
            : '';

        const languagesHTML = data.languages.length 
            ? `<h3>Idiomas</h3><ul>${data.languages.map(lang => `<li>${lang}</li>`).join('')}</ul>` 
            : '';

        const educationHTML = data.education.length
            ? `<h3>Educação</h3><ul>${data.education.map(edu => `<li>${edu.title} - ${edu.institution} (${edu.duration})</li>`).join('')}</ul>` 
            : '';

        const experienceHTML = data.experience.length
            ? `<h3>Experiência Profissional</h3><ul>${data.experience.map(exp => `<li><strong>${exp.title}</strong> - ${exp.company} (${exp.duration})<br>${exp.description}</li>`).join('')}</ul>` 
            : '';

        const certificationsHTML = data.certifications.length
            ? `<h3>Certificações</h3><ul>${data.certifications.map(cert => `<li><strong>${cert.name}</strong> - ${cert.institution}<br>${cert.description}</li>`).join('')}</ul>` 
            : '';

        const activitiesHTML = data.activities 
            ? `<h3>Atividades Extracurriculares</h3><p>${data.activities}</p>` 
            : '';

        // Layout em duas colunas para a versão web
        resumePreview.innerHTML = `
            <div class="resume-left custom-bg-color">
                ${data.photo ? `<img src="${data.photo}" alt="Foto">` : ''}
                <h2>${data.name}</h2>
                <div class="contact-info">
                    ${data.address ? `<p><strong>Endereço:</strong> ${data.address}</p>` : ''}
                    <p><strong>Telefone 1:</strong> ${data.phone1}</p>
                    ${data.phone2 ? `<p><strong>Telefone 2:</strong> ${data.phone2}</p>` : ''}
                    <p><strong>Email:</strong> ${data.email}</p>
                    ${data.linkedin ? `<p><strong>LinkedIn:</strong> ${data.linkedin}</p>` : ''}
                    ${languagesHTML}
                    ${skillsHTML}
                </div>
            </div>
            <div class="resume-right">
                ${data.summary ? `<div class="summary"><h3>Resumo</h3><p>${data.summary}</p></div>` : ''}
                ${educationHTML}
                ${experienceHTML}
                ${certificationsHTML}
                ${activitiesHTML}
            </div>
        `;
        console.log("Preview gerada:", resumePreview.innerHTML);
    }

    // 6. EVENTO PARA EXIBIR A PRÉ-VISUALIZAÇÃO DA FOTO
    photoInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('photoPreview').src = e.target.result;
                document.getElementById('photoPreview').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // 7. EVENTOS DOS BOTÕES
    document.getElementById('generateResumeButton').addEventListener('click', function (event) {
        event.preventDefault();
        generateResume();
    });

    downloadPdfBtn.addEventListener('click', function () {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true,
        });
        html2canvas(resumePreview, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            scrollX: 0,
            scrollY: 0
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 170;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            doc.save('curriculo.pdf');
        });
    });

    downloadWordBtn.addEventListener('click', function () {
        const resumeContent = resumePreview.innerHTML;
        if (!resumeContent.trim()) {
            alert("Gere o currículo antes de baixar!");
            return;
        }
        let documentContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='UTF-8'>
                <title>Currículo</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    #resumePreview { width: 100%; max-width: 800px; margin: auto; padding: 20px; }
                    h2 { color: #2a3eb1; }
                    ul { padding-left: 20px; }
                    li { margin-bottom: 5px; }
                </style>
            </head>
            <body>
                <div id="resumePreview">${resumeContent}</div>
            </body>
            </html>`;
        const blob = new Blob(['\ufeff', documentContent], { type: 'application/msword' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'curriculo.doc';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Atualiza a barra de progresso sempre que houver alterações
    fields.forEach(field => {
        field.addEventListener('input', updateProgress);
        if (field.type === 'file') {
            field.addEventListener('change', updateProgress);
        }
    });
});
