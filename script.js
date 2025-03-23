document.addEventListener('DOMContentLoaded', function () {
    // 📌 VARIÁVEIS GLOBAIS
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

    // ✅ CORRIGE O PREVIEW DA IMAGEM
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

    // 🔥 Chama a função quando o usuário selecionar uma imagem
    photoInput.addEventListener('change', previewImage);

    // ✅ ATUALIZA O CONTADOR DO RESUMO
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

    // ✅ ATUALIZA A BARRA DE PROGRESSO
    function updateProgress() {
        const fields = Array.from(resumeForm.querySelectorAll('input, textarea, select'));
        const filledFields = fields.filter(field => field.value.trim() !== '').length;
        const progress = Math.round((filledFields / fields.length) * 100);
        progressBar.value = progress;
        progressText.textContent = `${progress}%`;
    }
    resumeForm.addEventListener('input', updateProgress);

    // ✅ FUNÇÃO PARA ADICIONAR CAMPOS DINÂMICOS
    function addField(containerId, html) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ Container "${containerId}" não encontrado.`);
            return;
        }
        const newEntry = document.createElement('div');
        newEntry.classList.add('entry');
        newEntry.innerHTML = html;
        container.appendChild(newEntry);

        // Adiciona evento para remover
        newEntry.querySelector('.remove-button').addEventListener('click', function () {
            container.removeChild(newEntry);
            updateProgress();
        });
    }

    // ✅ EVENT LISTENERS PARA BOTÕES DE ADIÇÃO
    document.getElementById('addExperience')?.addEventListener('click', function () {
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

    document.getElementById('addEducation')?.addEventListener('click', function () {
        addField('educationContainer', `
            <div class="education-entry">
                <input type="text" class="education-title" placeholder="Nome do Curso">
                <input type="text" class="education-institution" placeholder="Instituição">
                <input type="text" class="education-duration" placeholder="Data de Início - Data de Conclusão">
                <button type="button" class="remove-button">Remover</button>
            </div>
        `);
    });

    document.getElementById('addCertification')?.addEventListener('click', function () {
        addField('certificationsContainer', `
            <div class="certification-entry">
                <input type="text" class="certification-name" placeholder="Nome da Certificação">
                <input type="text" class="certification-institution" placeholder="Instituição">
                <textarea class="certification-description" placeholder="Descrição breve"></textarea>
                <button type="button" class="remove-button">Remover</button>
            </div>
        `);
    });

    // ✅ FUNÇÃO PARA GERAR CURRÍCULO
    function generateResume() {
        console.log("🚀 Função generateResume chamada!");

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone1 = document.getElementById('phone1').value.trim();

        if (!name || !email || !phone1) {
            alert("Preencha os campos obrigatórios.");
            return;
        }

        resumePreview.style.display = "flex";
        resumePreview.style.flexDirection = "row";
        resumePreview.style.opacity = "1";

        // ✅ Captura a URL da imagem corretamente
        let imageUrl = photoPreview.src || "default-photo.jpg";

        // ✅ Captura valores corretos dos campos dinâmicos
        function getValues(containerId, className) {
            return Array.from(document.querySelectorAll(`#${containerId} .${className}`))
                .map(input => input.value.trim())
                .filter(value => value !== '');
        }

        const resumeData = {
            name,
            email,
            phone1,
            phone2: document.getElementById('phone2').value.trim(),
            linkedin: document.getElementById('linkedin').value.trim(),
            summary: summaryInput.value.trim(), 
            skills: document.getElementById('skills').value.split(',').map(s => s.trim()).filter(Boolean),
            languages: document.getElementById('languages').value.split(',').map(l => l.trim()).filter(Boolean),
            education: getValues('educationContainer', 'education-title').join(', '),
            experience: getValues('experienceContainer', 'experience-title').join(', '),
            certifications: getValues('certificationsContainer', 'certification-name').join(', '),
            activities: document.getElementById('activities').value.trim()
        };

        // ✅ Gera a pré-visualização corretamente
        resumePreview.innerHTML = `
        <div class="resume-left">
            <img src="${imageUrl}" alt="Foto do Candidato" />
            <h2>${resumeData.name}</h2>
            <p><strong>Email:</strong> ${resumeData.email}</p>
            <p><strong>Telefone:</strong> ${resumeData.phone1}</p>
            ${resumeData.phone2 ? `<p><strong>Telefone 2:</strong> ${resumeData.phone2}</p>` : ''}
            ${resumeData.linkedin ? `<p><strong>LinkedIn:</strong> ${resumeData.linkedin}</p>` : ''}
            
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
            ${resumeData.summary ? `<h3>Resumo Profissional</h3><p>${resumeData.summary}</p>` : ''} <!-- 📌 Adicionado aqui -->
            <h3>Educação</h3><p>${resumeData.education}</p>
            <h3>Experiência Profissional</h3><p>${resumeData.experience}</p>
            <h3>Certificações</h3><p>${resumeData.certifications}</p>
            ${resumeData.activities ? `<h3>Atividades Extracurriculares</h3><p>${resumeData.activities}</p>` : ''}
        </div>
    `;
    
}

        // ✅  Função para baixar currículo como PDF
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
                const imgWidth = 210; // Largura de uma folha A4 em mm
                const imgHeight = canvas.height * imgWidth / canvas.width; // Mantém a proporção da imagem
        
                // Garantir que a altura não ultrapasse o limite da página A4
                if (imgHeight > 297) {
                    const scaleFactor = 297 / imgHeight;
                    doc.addImage(imgData, 'PNG', 0, 0, imgWidth * scaleFactor, 297);
                } else {
                    doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                }
        
                doc.save('curriculo.pdf');
            });
        });
        

    // Listener para o botão "Gerar Currículo"
    document.getElementById('generateResumeButton').addEventListener('click', function (event) {
        event.preventDefault();
        generateResume();
    });
});
