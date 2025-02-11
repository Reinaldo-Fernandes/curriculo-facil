document.addEventListener('DOMContentLoaded', function () {
    // 1. VARIÁVEIS GLOBAIS
    const resumeForm = document.getElementById('resumeForm');
    const photoInput = document.getElementById('photo');
    const resumePreview = document.getElementById('resumePreview');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const fields = Array.from(resumeForm.querySelectorAll('input, textarea, select'));
    const downloadPdfBtn = document.getElementById('downloadPdf');
    const downloadWordBtn = document.getElementById('downloadWord');
    const generateResumeButton = document.getElementById('generateResumeButton');

    // 2. FUNÇÕES PARA ADICIONAR CAMPOS DINÂMICOS
    function addField(containerId, html) {
        const container = document.getElementById(containerId);
        const newEntry = document.createElement('div');
        newEntry.classList.add('entry');
        newEntry.innerHTML = html;
        container.appendChild(newEntry);
        newEntry.querySelector('.remove-button').addEventListener('click', function () {
            container.removeChild(newEntry);
        });
    }

    document.getElementById('addExperience').addEventListener('click', function () {
        addField('experienceContainer', `
            <div class="experience-entry">
                <input type="text" class="experience-title" placeholder="Cargo">
                <input type="text" class="experience-company" placeholder="Empresa">
                <input type="text" class="experience-duration" placeholder="Data de Início - Data de Término">
                <textarea class="experience-description" placeholder="Descrição breve"></textarea>
                <button type="button" class="remove-button">Remover</button>
            </div>
        `);
    });

    document.getElementById('addEducation').addEventListener('click', function () {
        addField('educationContainer', `
            <div class="education-entry">
                <input type="text" class="education-title" placeholder="Nome do Curso">
                <input type="text" class="education-institution" placeholder="Instituição">
                <input type="text" class="education-duration" placeholder="Data de Início - Data de Conclusão">
                <button type="button" class="remove-button">Remover</button>
            </div>
        `);
    });

    document.getElementById('addCertification').addEventListener('click', function () {
        addField('certificationsContainer', `
            <div class="certification-entry">
                <input type="text" class="certification-name" placeholder="Nome da Certificação">
                <input type="text" class="certification-institution" placeholder="Instituição">
                <textarea class="certification-description" placeholder="Descrição breve"></textarea>
                <button type="button" class="remove-button">Remover</button>
            </div>
        `);
    });

    // 3. FUNÇÕES AUXILIARES
    function updateProgress() {
        const totalFields = fields.length;
        let filledFields = fields.filter(field => field.value.trim() !== '').length;
        const progress = Math.round((filledFields / totalFields) * 100);
        progressBar.value = progress;
        progressText.textContent = `${progress}%`;
    }

    function getDynamicEntries(selector, fields) {
        return Array.from(document.querySelectorAll(selector)).map(entry => {
            let data = {};
            fields.forEach(field => {
                let element = entry.querySelector(field.selector);
                data[field.name] = element ? element.value.trim() : '';
            });
            return data;
        }).filter(entry => Object.values(entry).some(value => value));
    }

    function generateResume() {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone1 = document.getElementById('phone1').value.trim();

        if (!name || !email || !phone1) {
            alert("Preencha os campos obrigatórios.");
            resumePreview.style.display = "none";
            return;
        }

        resumePreview.style.display = "flex";

        const resumeData = {
            name,
            address: document.getElementById('address').value,
            phone1,
            phone2: document.getElementById('phone2').value,
            email,
            linkedin: document.getElementById('linkedin').value,
            summary: document.getElementById('summary').value.trim(),
            skills: document.getElementById('skills').value.split(',').map(s => s.trim()).filter(Boolean),
            languages: document.getElementById('languages').value.split(',').map(l => l.trim()).filter(Boolean),
            education: getDynamicEntries('.education-entry', [
                { selector: '.education-title', name: 'title' },
                { selector: '.education-institution', name: 'institution' },
                { selector: '.education-duration', name: 'duration' }
            ]),
            experience: getDynamicEntries('.experience-entry', [
                { selector: '.experience-title', name: 'title' },
                { selector: '.experience-company', name: 'company' },
                { selector: '.experience-duration', name: 'duration' },
                { selector: '.experience-description', name: 'description' }
            ]),
            certifications: getDynamicEntries('.certification-entry', [
                { selector: '.certification-name', name: 'name' },
                { selector: '.certification-institution', name: 'institution' },
                { selector: '.certification-description', name: 'description' }
            ]),
            activities: document.getElementById('activities').value.trim()
        };

        resumePreview.innerHTML = `
            <div class="resume-left">
                <h2>${resumeData.name}</h2>
                <p><strong>Email:</strong> ${resumeData.email}</p>
                <p><strong>Telefone:</strong> ${resumeData.phone1}</p>
                ${resumeData.phone2 ? `<p><strong>Telefone 2:</strong> ${resumeData.phone2}</p>` : ''}
                ${resumeData.linkedin ? `<p><strong>LinkedIn:</strong> ${resumeData.linkedin}</p>` : ''}
                ${resumeData.skills.length ? `<h3>Habilidades</h3><ul>${resumeData.skills.map(s => `<li>${s}</li>`).join('')}</ul>` : ''}
                ${resumeData.languages.length ? `<h3>Idiomas</h3><ul>${resumeData.languages.map(l => `<li>${l}</li>`).join('')}</ul>` : ''}
            </div>
            <div class="resume-right">
                ${resumeData.summary ? `<h3>Resumo</h3><p>${resumeData.summary}</p>` : ''}
                ${resumeData.education.length ? `<h3>Educação</h3><ul>${resumeData.education.map(e => `<li>${e.title} - ${e.institution} (${e.duration})</li>`).join('')}</ul>` : ''}
                ${resumeData.experience.length ? `<h3>Experiência Profissional</h3><ul>${resumeData.experience.map(exp => `<li>${exp.title} - ${exp.company} (${exp.duration})<br>${exp.description}</li>`).join('')}</ul>` : ''}
                ${resumeData.certifications.length ? `<h3>Certificações</h3><ul>${resumeData.certifications.map(cert => `<li>${cert.name} - ${cert.institution}<br>${cert.description}</li>`).join('')}</ul>` : ''}
                ${resumeData.activities ? `<h3>Atividades Extracurriculares</h3><p>${resumeData.activities}</p>` : ''}
            </div>
        `;
    }

    generateResumeButton.addEventListener('click', function (event) {
        event.preventDefault();
        generateResume();
    });

    fields.forEach(field => field.addEventListener('input', updateProgress));
});
