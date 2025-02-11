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

    // 2. EVENTOS DINÂMICOS PARA ADIÇÃO DE CAMPOS

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
            <input type="text" class="experience-title" placeholder="Cargo">
            <input type="text" class="experience-company" placeholder="Empresa">
            <input type="text" class="experience-duration" placeholder="Data de Início - Data de Término">
            <textarea class="experience-description" placeholder="Descrição breve"></textarea>
            <button type="button" class="remove-button">Remover</button>
        `);
    });

    document.getElementById('addEducation').addEventListener('click', function () {
        addField('educationContainer', `
            <input type="text" class="education-title" placeholder="Nome do Curso">
            <input type="text" class="education-institution" placeholder="Instituição">
            <input type="text" class="education-duration" placeholder="Data de Início - Data de Conclusão">
            <button type="button" class="remove-button">Remover</button>
        `);
    });

    document.getElementById('addCertification').addEventListener('click', function () {
        addField('certificationsContainer', `
            <input type="text" class="certification-name" placeholder="Nome da Certificação">
            <input type="text" class="certification-institution" placeholder="Instituição">
            <textarea class="certification-description" placeholder="Descrição breve"></textarea>
            <button type="button" class="remove-button">Remover</button>
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

    function formatPhone(phoneInput) {
        phoneInput.addEventListener('input', () => {
            let phoneValue = phoneInput.value.replace(/\D/g, '').slice(0, 11);
            phoneInput.value = phoneValue.replace(/^(\d{2})(\d{5})?(\d{4})$/, '($1) $2-$3');
        });
    }

    formatPhone(document.getElementById('phone1'));
    formatPhone(document.getElementById('phone2'));

    const summaryField = document.getElementById('summary');
    summaryField.addEventListener('input', function () {
        this.value = this.value.substring(0, 500);
        document.getElementById('summaryCounter').textContent = `${this.value.length} / 500 caracteres`;
    });

    // 4. FUNÇÃO PARA GERAR O CURRÍCULO

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
            summary: summaryField.value,
            skills: document.getElementById('skills').value.split(',').map(s => s.trim()).filter(s => s),
            languages: document.getElementById('languages').value.split(',').map(l => l.trim()).filter(l => l),
            photo: photoInput.files.length > 0 ? URL.createObjectURL(photoInput.files[0]) : ''
        };

        resumePreview.innerHTML = `
            <div class="resume-left">
                ${resumeData.photo ? `<img src="${resumeData.photo}" alt="Foto">` : ''}
                <h2>${resumeData.name}</h2>
                <p><strong>Email:</strong> ${resumeData.email}</p>
                <p><strong>Telefone:</strong> ${resumeData.phone1}</p>
                ${resumeData.phone2 ? `<p><strong>Telefone 2:</strong> ${resumeData.phone2}</p>` : ''}
                ${resumeData.linkedin ? `<p><strong>LinkedIn:</strong> ${resumeData.linkedin}</p>` : ''}
            </div>
            <div class="resume-right">
                ${resumeData.summary ? `<h3>Resumo</h3><p>${resumeData.summary}</p>` : ''}
            </div>
        `;
    }

    // 5. EVENTOS DOS BOTÕES

    generateResumeButton.addEventListener('click', function (event) {
        event.preventDefault();
        generateResume();
    });

    downloadPdfBtn.addEventListener('click', function () {
        if (resumePreview.style.display === "none") {
            alert("Gere o currículo antes de baixar o PDF.");
            return;
        }

        html2pdf().set({
            margin: 10,
            filename: 'curriculo.pdf',
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 2, logging: false, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(resumePreview).save();
    });

    downloadWordBtn.addEventListener('click', function () {
        const content = `
            <html><head><meta charset='UTF-8'></head><body>
            ${resumePreview.innerHTML}
            </body></html>`;

        const blob = new Blob(['\ufeff' + content], { type: 'application/msword' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'curriculo.doc';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    fields.forEach(field => field.addEventListener('input', updateProgress));
});
