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
        console.log("🚀 Função generateResume chamada!"); // Debug

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

        // Dados do currículo
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

        // ✅ Gera a pré-visualização corretamente
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
});
