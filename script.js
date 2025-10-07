document.addEventListener('DOMContentLoaded', function () {
    const resumeForm = document.getElementById('resumeForm');
    const resumePreview = document.getElementById('resumePreview');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const downloadPdfBtn = document.getElementById('downloadPdf');
    const generateResumeButton = document.getElementById('generateResumeButton');
    const photoInput = document.getElementById('photo');
    const photoPreview = document.getElementById('photoPreview');
    const summaryInput = document.getElementById('summary');
    const summaryCounter = document.getElementById('summaryCounter');
    const errorMessageDiv = document.getElementById('error-message');

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phone1Input = document.getElementById('phone1');

    // Preview da imagem carregada
    function previewImage() {
        if (photoInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = function (e) {
                photoPreview.src = e.target.result;
                photoPreview.style.display = "block";
            };
            reader.readAsDataURL(photoInput.files[0]);
        }
    }
    photoInput.addEventListener('change', previewImage);

    // Contador de caracteres do resumo
    summaryInput.addEventListener('input', function () {
        const maxLength = 500;
        const currentLength = summaryInput.value.length;

        if (currentLength > maxLength) {
            summaryInput.value = summaryInput.value.substring(0, maxLength);
        }
        summaryCounter.textContent = `${summaryInput.value.length} / ${maxLength} caracteres`;
    });

    // Atualiza barra de progresso preenchimento campos
    function updateProgress() {
        const fields = Array.from(resumeForm.querySelectorAll('input:not([type="file"]):not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly]), select:not([disabled]):not([readonly])'));
        const filledFields = fields.filter(field => field.value.trim() !== '').length;
        const totalFields = fields.length;

        let progress = 0;
        if (totalFields > 0) {
            progress = Math.round((filledFields / totalFields) * 100);
        }

        progressBar.value = progress;
        progressText.textContent = `${progress}%`;
    }

    resumeForm.addEventListener('input', updateProgress);
    updateProgress();

    // Função para adicionar campos dinâmicos (experiência, educação, certificações)
    function addField(containerId, htmlContent) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ Container "${containerId}" não encontrado.`);
            return;
        }
        const newEntry = document.createElement('div');
        newEntry.classList.add('entry');
        newEntry.innerHTML = htmlContent;
        container.appendChild(newEntry);

        // Botão remover
        newEntry.querySelector('.remove-button').addEventListener('click', function () {
            container.removeChild(newEntry);
            updateProgress();
        });
        updateProgress();
    }

    document.getElementById('addExperience')?.addEventListener('click', function () {
        addField('experienceContainer', `
            <div class="experience-entry">
                <label>Cargo</label>
                <input type="text" class="experience-title" placeholder="Cargo">
                <label>Empresa</label>
                <input type="text" class="experience-company" placeholder="Empresa">
                <label>Período</label>
                <input type="text" class="experience-duration" placeholder="Data de Início - Data de Término">
                <label>Descrição</label>
                <textarea class="experience-description" placeholder="Descrição breve"></textarea>
                <button type="button" class="remove-button">Remover</button>
            </div>
        `);
    });

    document.getElementById('addEducation')?.addEventListener('click', function () {
        addField('educationContainer', `
            <div class="education-entry">
                <label>Nome do Curso</label>
                <input type="text" class="education-title" placeholder="Nome do Curso">
                <label>Instituição</label>
                <input type="text" class="education-institution" placeholder="Instituição">
                <label>Período</label>
                <input type="text" class="education-duration" placeholder="Data de Início - Data de Conclusão">
                <button type="button" class="remove-button">Remover</button>
            </div>
        `);
    });

    document.getElementById('addCertification')?.addEventListener('click', function () {
        addField('certificationsContainer', `
            <div class="certification-entry">
                <label>Nome da Certificação</label>
                <input type="text" class="certification-name" placeholder="Nome da Certificação">
                <label>Instituição</label>
                <input type="text" class="certification-institution" placeholder="Instituição">
                <label>Descrição</label>
                <textarea class="certification-description" placeholder="Descrição breve"></textarea>
                <button type="button" class="remove-button">Remover</button>
            </div>
        `);
    });

    // Gera dados do currículo e atualiza preview HTML
    function generateResume() {
        let hasError = false;

        // Valida campos obrigatórios
        if (!nameInput.value.trim()) {
            nameInput.classList.add("input-error");
            hasError = true;
        } else {
            nameInput.classList.remove("input-error");
        }

        if (!emailInput.value.trim()) {
            emailInput.classList.add("input-error");
            hasError = true;
        } else {
            emailInput.classList.remove("input-error");
        }

        if (!phone1Input.value.trim()) {
            phone1Input.classList.add("input-error");
            hasError = true;
        } else {
            phone1Input.classList.remove("input-error");
        }

        if (hasError) {
            errorMessageDiv.textContent = "Por favor, preencha todos os campos obrigatórios (Nome, Email, Telefone).";
            errorMessageDiv.style.display = "block";
            resumePreview.style.display = "none";
            return;
        }

        errorMessageDiv.style.display = "none";
        resumePreview.classList.add('force-desktop-layout');
        resumePreview.style.display = "flex";
        resumePreview.style.opacity = "1";

        // Imagem da foto se existir
        let imageUrl = photoPreview.src && photoPreview.src !== window.location.href ? `<img src='${photoPreview.src}' alt='Foto do Candidato' />` : '';

        // Função para capturar dados dos campos dinâmicos
        function getDynamicEntries(containerId, fieldClasses) {
            const container = document.getElementById(containerId);
            if (!container) return [];
            const entries = Array.from(container.children);
            return entries.map(entry => {
                const data = {};
                fieldClasses.forEach(cls => {
                    const element = entry.querySelector(`.${cls}`);
                    if (element) {
                        const key = cls.replace(/-([a-z])/g, (match) => match[1].toUpperCase());
                        data[key] = element.value.trim();
                    }
                });
                return data;
            }).filter(data => Object.values(data).some(value => value !== ''));
        }

        const educationEntries = getDynamicEntries('educationContainer', ['education-title', 'education-institution', 'education-duration']);
        const experienceEntries = getDynamicEntries('experienceContainer', ['experience-title', 'experience-company', 'experience-duration', 'experience-description']);
        const certificationEntries = getDynamicEntries('certificationsContainer', ['certification-name', 'certification-institution', 'certification-description']);

        const resumeData = {
            name: nameInput.value.trim(),
            address: document.getElementById('address').value.trim(),
            email: emailInput.value.trim(),
            phone1: phone1Input.value.trim(),
            phone2: document.getElementById('phone2').value.trim(),
            linkedin: document.getElementById('linkedin').value.trim(),
            summary: summaryInput.value.trim(),
            skills: document.getElementById('skills').value.split(',').map(s => s.trim()).filter(Boolean),
            languages: document.getElementById('languages').value.split(',').map(l => l.trim()).filter(Boolean),
            education: educationEntries,
            experience: experienceEntries,
            certifications: certificationEntries,
            activities: document.getElementById('activities').value.trim(),
        };

        // Atualiza preview HTML do currículo
        resumePreview.innerHTML = `
            <div class="resume-left custom-bg-color">
                ${imageUrl}
                <h2>${resumeData.name}</h2>
                <p>${resumeData.address ? `<strong>Endereço:</strong> ${resumeData.address}` : ''}</p>
                <p><strong>Email:</strong> ${resumeData.email}</p>
                <p><strong>Telefone:</strong> ${resumeData.phone1}</p>
                ${resumeData.phone2 ? `<p><strong>Telefone 2:</strong> ${resumeData.phone2}</p>` : ''}
                ${resumeData.linkedin ? `<p><strong>LinkedIn:</strong> <a href="${resumeData.linkedin}" target="_blank">${resumeData.linkedin}</a></p>` : ''}

                ${resumeData.skills.length || resumeData.languages.length ? `
                    <h3>Habilidades e Idiomas</h3>
                    <div class="skills-languages-container">
                        ${resumeData.languages.length ? `
                            <h4>Idiomas:</h4>
                            <ul>${resumeData.languages.map(l => `<li>${l}</li>`).join('')}</ul>
                        ` : ''}
                        ${resumeData.skills.length ? `
                            <h4>Habilidades:</h4>
                            <ul>${resumeData.skills.map(s => `<li>${s}</li>`).join('')}</ul>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
            <div class="resume-right">
                ${resumeData.summary ? `<h3>Resumo Profissional</h3><p>${resumeData.summary}</p>` : ''}

                ${resumeData.experience.length ? `<h3>Experiência Profissional</h3>` +
                    resumeData.experience.map(exp => `
                        <p>
                            <strong>${exp.experienceTitle}</strong> - ${exp.experienceCompany} (${exp.experienceDuration})<br>
                            ${exp.experienceDescription}
                        </p>`).join('') : ''}

                ${resumeData.education.length ? `<h3>Educação</h3>` +
                    resumeData.education.map(edu => `
                        <p>
                            <strong>${edu.educationTitle}</strong> - ${edu.educationInstitution} (${edu.educationDuration})
                        </p>`).join('') : ''}

                ${resumeData.certifications.length ? `<h3>Certificações</h3>` +
                    resumeData.certifications.map(cert => `
                        <p>
                            <strong>${cert.certificationName}</strong> - ${cert.certificationInstitution}<br>
                            ${cert.certificationDescription}
                        </p>`).join('') : ''}

                ${resumeData.activities ? `<h3>Atividades Complementares</h3><p>${resumeData.activities}</p>` : ''}
            </div>
        `;
        updateProgress();
    }

    generateResumeButton.addEventListener('click', function (event) {
        event.preventDefault();
        generateResume();
    });

    // Botão baixar PDF
    downloadPdfBtn.addEventListener('click', function (event) {
        event.preventDefault();

        generateResume();

        html2canvas(resumePreview, {
            scale: 5,          // qualidade da imagem
            useCORS: true,     // permite imagens externas
            logging: false     // desativa logs no console
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            // Mantém proporção da imagem para calcular altura no PDF
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
            pdf.save('curriculo.pdf');
        }).catch(error => {
            console.error("Erro ao gerar PDF:", error);
            alert("Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.");
        });
    });

    // Inicializa preview vazio
    generateResume();
});
