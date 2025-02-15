document.addEventListener('DOMContentLoaded', function () {
    // 1. VARIÁVEIS GLOBAIS
    const resumeForm = document.getElementById('resumeForm');
    const resumePreview = document.getElementById('resumePreview');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const downloadPdfBtn = document.getElementById('downloadPdf');
    const downloadWordBtn = document.getElementById('downloadWord');
    const generateResumeButton = document.getElementById('generateResumeButton');
    const profileImage = document.getElementById('photo')?.files[0];

    // ✅ Garante que a pré-visualização está oculta ao carregar a página
    resumePreview.style.display = "block";
        setTimeout(() => {
            resumePreview.style.opacity = "1";
        }, 100);

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
            return;
        }
    
        resumePreview.style.display = "flex";
        resumePreview.style.flexDirection = "row";
        resumePreview.style.opacity = "1";
    
        // Captura a URL da imagem, se houver
        const profileImage = document.getElementById('profileImage')?.files[0];
        let imageUrl = "default-photo.jpg"; // Imagem padrão
        if (profileImage) {
            imageUrl = URL.createObjectURL(profileImage);
        }
    
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
            <div class="resume-left">
                <img src="${imageUrl}" alt="Foto do Candidato" />
                <h2>${resumeData.name}</h2>
                <p><strong>Email:</strong> ${resumeData.email}</p>
                <p><strong>Telefone:</strong> ${resumeData.phone1}</p>
                ${resumeData.phone2 ? `<p><strong>Telefone 2:</strong> ${resumeData.phone2}</p>` : ''}
                ${resumeData.linkedin ? `<p><strong>LinkedIn:</strong> ${resumeData.linkedin}</p>` : ''}
                ${resumeData.skills.length ? `<h3>Habilidades</h3><ul>${resumeData.skills.map(s => `<li>${s}</li>`).join('')}</ul>` : ''}
                ${resumeData.languages.length ? `<h3>Idiomas</h3><ul>${resumeData.languages.map(l => `<li>${l}</li>`).join('')}</ul>` : ''}
            </div>
            <div class="resume-right">
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
    
        const options = {
            margin: [10, 10, 10, 10], 
            filename: 'curriculo.pdf',
            image: { type: 'jpeg', quality: 1 }, // Qualidade máxima da imagem
            html2canvas: { 
                scale: 4, // Aumenta a qualidade (escala padrão é 2)
                useCORS: true,
                allowTaint: true,
                logging: false
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait' 
            }
        };
    
        html2pdf().set(options).from(resumePreview).save();
    });
    

    // 📥 DOWNLOAD WORD
    downloadPdfBtn.addEventListener('click', function () {
        if (!resumePreview.innerHTML.trim()) {
            alert("Gere o currículo antes de baixar o PDF.");
            return;
        }
    
        const options = {
            margin: [5, 5, 5, 5], // Mantém margens uniformes
            filename: 'curriculo.pdf',
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { 
                scale: 3, // Melhora nitidez
                useCORS: true,
                allowTaint: true,
                logging: false
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
    
        html2pdf().set(options).from(resumePreview).save();
    });
    
    // Atualiza barra de progresso ao alterar campos
    document.querySelectorAll('input, textarea, select').forEach(field => {
        field.addEventListener('input', updateProgress);
    });

    if (window.innerWidth <= 768) {
        setTimeout(() => {
            html2pdf().set(options).from(resumePreview).save();
        }, 500);
        
    }
    
});
