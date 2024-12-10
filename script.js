document.addEventListener('DOMContentLoaded', function () {
    // 1. VARIÁVEIS GLOBAIS
    const resumeForm = document.getElementById('resumeForm');
    const photoInput = document.getElementById('photo');
    const resumePreview = document.getElementById('resumePreview');
    const progressBar = document.getElementById('progressBar'); // Barra de progresso
    const progressText = document.getElementById('progressText'); // Texto do progresso
    const fields = Array.from(resumeForm.querySelectorAll('input, textarea')); // Seleciona todos os inputs e textareas

    // 2. FUNÇÕES AUXILIARES
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

    function addSection(buttonId, containerId, entryHTML) {
        document.getElementById(buttonId).addEventListener('click', function () {
            const container = document.getElementById(containerId);
            const newEntry = document.createElement('div');
            newEntry.classList.add('entry');
            newEntry.innerHTML = entryHTML;
            container.appendChild(newEntry);

            // Atualiza progresso ao adicionar/remover
            newEntry.querySelector('.remove-button').addEventListener('click', function () {
                container.removeChild(newEntry);
                updateProgress();
            });

            updateProgress();
        });
    }

    function formatPhone(phoneInput) {
        phoneInput.addEventListener('input', () => {
            let phoneValue = phoneInput.value.replace(/\D/g, '');
            if (phoneValue.length > 10) {
                phoneInput.value = `(${phoneValue.slice(0, 2)}) ${phoneValue.slice(2, 7)}-${phoneValue.slice(7, 11)}`;
            } else if (phoneValue.length > 6) {
                phoneInput.value = `(${phoneValue.slice(0, 2)}) ${phoneValue.slice(2, 6)}-${phoneValue.slice(6)}`;
            } else if (phoneValue.length > 2) {
                phoneInput.value = `(${phoneValue.slice(0, 2)}) ${phoneValue.slice(2)}`;
            }
        });
    }

       // Contador para o campo "Resumo"
       document.getElementById('summary').addEventListener('input', function () {
        const summary = document.getElementById('summary');
        const counter = document.getElementById('summaryCounter');
        const maxLength = 500;
        const currentLength = summary.value.length;

        if (currentLength > maxLength) {
            summary.value = summary.value.substring(0, maxLength);
        }
        counter.textContent = `${summary.value.length} / ${maxLength} caracteres`;
    });

    // 3. INICIALIZAÇÃO E EVENTOS
     // Exibe o texto do tooltip dinamicamente
     document.querySelectorAll('.info-card').forEach(card => {
        const tooltip = card.querySelector('.tooltip');
        const text = card.getAttribute('data-text');
        if (tooltip && text) {
            tooltip.textContent = text;
        }
    });
    // Atualiza progresso nos campos
    fields.forEach(field => {
        field.addEventListener('input', updateProgress);
        if (field.type === 'file') field.addEventListener('change', updateProgress);
    });

    // Inicializa formatação de telefones
    formatPhone(document.getElementById('phone1'));
    formatPhone(document.getElementById('phone2'));

   
    // Função para adicionar entrada dinâmica de seções
    function addSection(buttonId, containerId, entryHTML) {
        document.getElementById(buttonId).addEventListener('click', function () {
            const container = document.getElementById(containerId);
            const newEntry = document.createElement('div');
            newEntry.classList.add('entry');
            newEntry.innerHTML = entryHTML;
            container.appendChild(newEntry);

            // Adiciona evento de remoção para o novo elemento
            newEntry.querySelector('.remove-button').addEventListener('click', function () {
                container.removeChild(newEntry);
            });
        });
    }

    // Adiciona seções dinâmicas
    addSection('addEducation', 'educationContainer', `
        <div class="education-entry">
            <input type="text" class="education-title" placeholder="Nome do Curso">
            <input type="text" class="education-institution" placeholder="Instituição">
            <input type="text" class="education-duration" placeholder="Data de Início - Data de Conclusão">
            <button type="button" class="remove-button">Remover</button>
        </div>
    `);

    addSection('addExperience', 'experienceContainer', `
        <div class="experience-entry">
            <input type="text" class="experience-title" placeholder="Cargo">
            <input type="text" class="experience-company" placeholder="Empresa">
            <input type="text" class="experience-duration" placeholder="Data de Início - Data de Término">
            <textarea class="experience-description" placeholder="Descrição breve"></textarea>
            <button type="button" class="remove-button">Remover</button>
        </div>
    `);

    addSection('addCertification', 'certificationsContainer', `
        <div class="certification-entry">
            <input type="text" class="certification-name" placeholder="Nome da Certificação">
            <input type="text" class="certification-institution" placeholder="Instituição">
            <textarea class="certification-description" placeholder="Descrição breve"></textarea>
            <button type="button" class="remove-button">Remover</button>
        </div>
    `);

    // Inicializa progresso
    updateProgress();

    // Geração do currículo
    document.getElementById('generateResumeButton').addEventListener('click', function (event) {
        event.preventDefault();
        generateResume();
    });

    function generateResume() {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone1 = document.getElementById('phone1').value;
    
        if (!name || !email || !phone1) {
            alert("Por favor, preencha os campos obrigatórios.");
            return;
        }
    
        const resumeData = {
            name: name,
            address: document.getElementById('address').value,
            phone1: phone1,
            phone2: document.getElementById('phone2').value,
            email: email,
            linkedin: document.getElementById('linkedin').value,
            summary: document.getElementById('summary').value,
            education: Array.from(document.querySelectorAll('.education-entry')).map(entry => ({
                title: entry.querySelector('.education-title').value,
                institution: entry.querySelector('.education-institution').value,
                duration: entry.querySelector('.education-duration').value,
            })),
            experience: Array.from(document.querySelectorAll('.experience-entry')).map(entry => ({
                title: entry.querySelector('.experience-title').value,
                company: entry.querySelector('.experience-company').value,
                duration: entry.querySelector('.experience-duration').value,
                description: entry.querySelector('.experience-description').value,
            })),
            certifications: Array.from(document.querySelectorAll('.certification-entry')).map(entry => ({
                name: entry.querySelector('.certification-name').value,
                institution: entry.querySelector('.certification-institution').value,
                description: entry.querySelector('.certification-description').value,
            })),
            activities: document.getElementById('activities').value,
            skills: document.getElementById('skills').value.split(',').map(skill => skill.trim()).filter(skill => skill),
            languages: document.getElementById('languages').value.split(',').map(lang => lang.trim()).filter(lang => lang),
            photo: photoInput.files.length > 0 ? URL.createObjectURL(photoInput.files[0]) : '',
        };
    
        displayResumePreview(resumeData);
        resumePreview.style.display = 'flex';
    }
    
    function displayResumePreview(data) {
        const skillsHTML = data.skills && data.skills.length 
            ? `<h3>Habilidades</h3><ul>${data.skills.map(skill => `<li>${skill}</li>`).join('')}</ul>` 
            : '';
        
        const languagesHTML = data.languages && data.languages.length 
            ? `<h3>Idiomas</h3><ul>${data.languages.map(lang => `<li>${lang}</li>`).join('')}</ul>` 
            : '';
        
        const educationHTML = data.education && data.education.length
            ? `<h3>Educação</h3><ul>${data.education.map(edu => `<li>${edu.title} - ${edu.institution} (${edu.duration})</li>`).join('')}</ul>` 
            : '';
        
        const experienceHTML = data.experience && data.experience.length
            ? `<h3>Experiência Profissional</h3><ul>${data.experience.map(exp => `<li><strong>${exp.title}</strong> - ${exp.company} (${exp.duration})<br>${exp.description}</li>`).join('')}</ul>` 
            : '';
        
        const certificationsHTML = data.certifications && data.certifications.length
            ? `<h3>Certificações</h3><ul>${data.certifications.map(cert => `<li><strong>${cert.name}</strong> - ${cert.institution}<br>${cert.description}</li>`).join('')}</ul>` 
            : '';
        
        const activitiesHTML = data.activities 
            ? `<h3>Atividades Extracurriculares</h3><p>${data.activities}</p>` 
            : '';
    
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
    }    
    
      // Função para baixar currículo como PDF
      document.getElementById('downloadPdf').addEventListener('click', function (event) {
        event.preventDefault();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const resumePreview = document.getElementById('resumePreview');
        html2canvas(resumePreview, { scale: 3, useCORS: true }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            doc.save('curriculo.pdf');
        });
    });

    // Listener para o botão "Gerar Currículo"
    document.getElementById('generateResumeButton').addEventListener('click', function (event) {
        event.preventDefault();
        generateResume();
    });
});
