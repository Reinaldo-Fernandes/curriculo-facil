document.addEventListener('DOMContentLoaded', function () {
    // 1. VARIÁVEIS GLOBAIS
    const resumeForm = document.getElementById('resumeForm');
    const resumePreview = document.getElementById('resumePreview');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const downloadPdfBtn = document.getElementById('downloadPdf');
    const downloadWordBtn = document.getElementById('downloadWord');
    const generateResumeButton = document.getElementById('generateResumeButton');

    // ✅ Garante que a pré-visualização está oculta ao carregar a página
    resumePreview.style.display = "none";
    resumePreview.style.opacity = "0";

    // 2. FUNÇÃO PARA ADICIONAR CAMPOS DINÂMICOS
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

    // 3. FUNÇÃO PARA ATUALIZAR A BARRA DE PROGRESSO
    function updateProgress() {
        const fields = Array.from(resumeForm.querySelectorAll('input, textarea, select'));
        const totalFields = fields.length;
        let filledFields = fields.filter(field => field.value.trim() !== '').length;
        const progress = Math.round((filledFields / totalFields) * 100);
        progressBar.value = progress;
        progressText.textContent = `${progress}%`;
    }

    // 4. FUNÇÃO PARA GERAR O CURRÍCULO
    function generateResume() {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone1 = document.getElementById('phone1').value.trim();

        if (!name || !email || !phone1) {
            alert("Preencha os campos obrigatórios.");
            resumePreview.style.display = "none";
            resumePreview.style.opacity = "0";
            return;
        }

        // ✅ Exibe a pré-visualização apenas depois de gerar o currículo
        resumePreview.style.display = "block";
        setTimeout(() => {
            resumePreview.style.opacity = "1";
        }, 100);

        // 🔥 Corrige a coleta de dados dinâmicos
        const resumeData = {
            name,
            email,
            phone1,
            phone2: document.getElementById('phone2').value,
            linkedin: document.getElementById('linkedin').value,
            summary: document.getElementById('summary').value.trim(),
            skills: document.getElementById('skills').value.split(',').map(s => s.trim()).filter(Boolean),
            languages: document.getElementById('languages').value.split(',').map(l => l.trim()).filter(Boolean),
            education: document.getElementById('educationContainer').innerHTML,
            experience: document.getElementById('experienceContainer').innerHTML,
            certifications: document.getElementById('certificationsContainer').innerHTML,
            activities: document.getElementById('activities').value.trim()
        };

        resumePreview.innerHTML = `
            <div class="resume-content">
                <h2>${resumeData.name}</h2>
                <p><strong>Email:</strong> ${resumeData.email}</p>
                <p><strong>Telefone:</strong> ${resumeData.phone1}</p>
                ${resumeData.phone2 ? `<p><strong>Telefone 2:</strong> ${resumeData.phone2}</p>` : ''}
                ${resumeData.linkedin ? `<p><strong>LinkedIn:</strong> ${resumeData.linkedin}</p>` : ''}
                ${resumeData.skills.length ? `<h3>Habilidades</h3><ul>${resumeData.skills.map(s => `<li>${s}</li>`).join('')}</ul>` : ''}
                ${resumeData.languages.length ? `<h3>Idiomas</h3><ul>${resumeData.languages.map(l => `<li>${l}</li>`).join('')}</ul>` : ''}
                <h3>Educação</h3>${resumeData.education}
                <h3>Experiência Profissional</h3>${resumeData.experience}
                <h3>Certificações</h3>${resumeData.certifications}
                ${resumeData.activities ? `<h3>Atividades Extracurriculares</h3><p>${resumeData.activities}</p>` : ''}
            </div>
        `;
    }

    generateResumeButton.addEventListener('click', function (event) {
        event.preventDefault();
        generateResume();
    });

    // 📥 DOWNLOAD PDF
    downloadPdfBtn.addEventListener('click', function () {
        if (!resumePreview.innerHTML.trim()) {
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

    // 📥 DOWNLOAD WORD
    downloadPdfBtn.addEventListener('click', function () {
        if (!resumePreview.innerHTML.trim()) {
            alert("Gere o currículo antes de baixar o PDF.");
            return;
        }
    
        const element = document.getElementById('resumePreview');
        
        html2canvas(element, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
    
            const imgWidth = 210; // Largura A4 em mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width; // Mantém proporção
    
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save('curriculo.pdf');
        });
    });
    
    fields.forEach(field => field.addEventListener('input', updateProgress));
});
