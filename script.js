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

 // ✅ WhatsApp Bottom
 document.getElementById('shareWhatsApp').addEventListener('click', function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const resumePreview = document.getElementById('resumePreview');

    html2canvas(resumePreview, {
        scale: 2,
        useCORS: true,
        scrollY: -window.scrollY
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

        // Salva como Blob para gerar URL
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);

        // Criar link de download
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = 'curriculo.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Criar link para WhatsApp
        const whatsappMessage = encodeURIComponent("Confira meu currículo! Baixe aqui: " + pdfUrl);
        const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;

        // Abre o WhatsApp
        window.open(whatsappUrl, '_blank');
    });
});

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
        resumePreview.style.minHeight = "auto";

        // ✅ Captura a URL da imagem corretamente
        let imageUrl = photoPreview.src && photoPreview.src !== window.location.href ? `<img src='${photoPreview.src}' alt='Foto do Candidato' />` : '';

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
            education: getValues('educationContainer', 'education-title'),
            experience: getValues('experienceContainer', 'experience-title'),
            certifications: getValues('certificationsContainer', 'certification-name'),
            activities: document.getElementById('activities').value.trim(),

            education: getValues('educationContainer', 'education-title').map((title, index) => ({
                title,
                institution: document.querySelectorAll('.education-institution')[index]?.value.trim() || '',
                duration: document.querySelectorAll('.education-duration')[index]?.value.trim() || ''
            })),
            experience: getValues('experienceContainer', 'experience-title').map((title, index) => ({
                title,
                company: document.querySelectorAll('.experience-company')[index]?.value.trim() || '',
                duration: document.querySelectorAll('.experience-duration')[index]?.value.trim() || '',
                description: document.querySelectorAll('.experience-description')[index]?.value.trim() || ''
            })),
            certifications: getValues('certificationsContainer', 'certification-name').map((name, index) => ({
                name,
                institution: document.querySelectorAll('.certification-institution')[index]?.value.trim() || '',
                description: document.querySelectorAll('.certification-description')[index]?.value.trim() || ''
            }))
        };

        // ✅ Gera a pré-visualização corretamente
        resumePreview.innerHTML = `
        <div class="resume-left">
        ${imageUrl}
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
    ${resumeData.summary ? `<h3>Resumo Profissional</h3><p>${resumeData.summary}</p>` : ''}

    ${resumeData.education.length ? `<h3>Educação</h3>` + 
        resumeData.education.map(edu => `<p><strong>${edu.title}</strong> - ${edu.institution} (${edu.duration})</p>`).join('') : ''}

    ${resumeData.experience.length ? `<h3>Experiência Profissional</h3>` + 
        resumeData.experience.map(exp => `<p><strong>${exp.title}</strong> - ${exp.company} (${exp.duration})<br>${exp.description}</p>`).join('') : ''}

    ${resumeData.certifications.length ? `<h3>Certificações</h3>` + 
        resumeData.certifications.map(cert => `<p><strong>${cert.name}</strong> - ${cert.institution}<br>${cert.description}</p>`).join('') : ''}

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
        
            html2canvas(resumePreview, {
                scale: 4,
                useCORS: true,
                logging: false, // Evita logs desnecessários no console
                scrollY: -window.scrollY // Corrige problemas de captura de posição
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = 210; // Largura A4
                const imgHeight = (canvas.height * imgWidth) / canvas.width; // Mantém a proporção da imagem
        
                doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                doc.save('curriculo.pdf');
            });
        });
        
    // Listener para o botão "Gerar Currículo"
    document.getElementById('generateResumeButton').addEventListener('click', function (event) {
        event.preventDefault();
        generateResume();
    });

    // Atualiza o currículo quando a janela é redimensionada
window.addEventListener('resize', function () {
    if (document.getElementById('generateResumeButton')) {
      generateResume();
    }
  });
});
