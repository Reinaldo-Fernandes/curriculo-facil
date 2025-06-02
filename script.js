document.addEventListener('DOMContentLoaded', function () {
    // 📌 VARIÁVEIS DO DOM
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

    // ---
    // ✅ PRÉ-VISUALIZAÇÃO DA IMAGEM
    // ---
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

    // ---
    // ✅ CONTADOR DE CARACTERES DO RESUMO
    // ---
    summaryInput.addEventListener('input', function () {
        const maxLength = 500;
        const currentLength = summaryInput.value.length;

        if (currentLength > maxLength) {
            summaryInput.value = summaryInput.value.substring(0, maxLength);
        }
        summaryCounter.textContent = `${summaryInput.value.length} / ${maxLength} caracteres`;
    });

    // ---
    // ✅ ATUALIZAÇÃO DA BARRA DE PROGRESSO
    // ---
    function updateProgress() {
        // Exclui input type="file" e campos desabilitados/somente leitura
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

    // Inicializa a barra de progresso e adiciona listener
    resumeForm.addEventListener('input', updateProgress);
    updateProgress();

    // ---
    // ✅ ADICIONA CAMPOS DINÂMICOS (EDUCAÇÃO, EXPERIÊNCIA, CERTIFICAÇÕES)
    // ---
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

        newEntry.querySelector('.remove-button').addEventListener('click', function () {
            container.removeChild(newEntry);
            updateProgress();
        });
        updateProgress();
    }

    document.getElementById('addExperience')?.addEventListener('click', function () {
        addField('experienceContainer', `
            <div class="experience-entry">
                <label for="exp-title">Cargo</label>
                <input type="text" class="experience-title" placeholder="Cargo">
                <label for="exp-company">Empresa</label>
                <input type="text" class="experience-company" placeholder="Empresa">
                <label for="exp-duration">Período</label>
                <input type="text" class="experience-duration" placeholder="Data de Início - Data de Término">
                <label for="exp-description">Descrição</label>
                <textarea class="experience-description" placeholder="Descrição breve"></textarea>
                <button type="button" class="remove-button">Remover</button>
            </div>
        `);
    });

    document.getElementById('addEducation')?.addEventListener('click', function () {
        addField('educationContainer', `
            <div class="education-entry">
                <label for="edu-title">Nome do Curso</label>
                <input type="text" class="education-title" placeholder="Nome do Curso">
                <label for="edu-institution">Instituição</label>
                <input type="text" class="education-institution" placeholder="Instituição">
                <label for="edu-duration">Período</label>
                <input type="text" class="education-duration" placeholder="Data de Início - Data de Conclusão">
                <button type="button" class="remove-button">Remover</button>
            </div>
        `);
    });

    document.getElementById('addCertification')?.addEventListener('click', function () {
        addField('certificationsContainer', `
            <div class="certification-entry">
                <label for="cert-name">Nome da Certificação</label>
                <input type="text" class="certification-name" placeholder="Nome da Certificação">
                <label for="cert-institution">Instituição</label>
                <input type="text" class="certification-institution" placeholder="Instituição">
                <label for="cert-description">Descrição</label>
                <textarea class="certification-description" placeholder="Descrição breve"></textarea>
                <button type="button" class="remove-button">Remover</button>
            </div>
        `);
    });

    // ---
    // ✅ FUNÇÃO PARA GERAR O CURRÍCULO (PRÉ-VISUALIZAÇÃO)
    // ---
    function generateResume() {
        console.log("🚀 Função generateResume chamada!");

        let hasError = false;

        // Validação dos campos obrigatórios
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
            resumePreview.style.display = "none"; // Esconde o preview se houver erro
            return;
        }

        errorMessageDiv.style.display = "none"; // Esconde a mensagem de erro se tudo estiver OK

        // **ADICIONA A CLASSE PARA FORÇAR O LAYOUT DESKTOP**
        resumePreview.classList.add('force-desktop-layout');

        // Exibe o preview e ajusta o layout
        resumePreview.style.display = "flex";
        resumePreview.style.opacity = "1";

        let imageUrl = photoPreview.src && photoPreview.src !== window.location.href ? `<img src='${photoPreview.src}' alt='Foto do Candidato' />` : '';

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

        // Renderiza o HTML do currículo
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

                ${resumeData.activities ? `<h3>Atividades Extracurriculares</h3><p>${resumeData.activities}</p>` : ''}
            </div>
        `;
    }

    // ---
    // ✅ DOWNLOAD DO CURRÍCULO COMO PDF
    // ---
    downloadPdfBtn.addEventListener('click', function (event) {
        event.preventDefault();
        const { jsPDF } = window.jspdf;

        // Garante que o preview esteja gerado e com o layout de desktop forçado
        generateResume(); 

        // Temporariamente ajusta a altura do resumePreview para o conteúdo total
        // Isso é crucial para que html2canvas capture o currículo inteiro, e não apenas uma página A4
        resumePreview.style.height = 'auto'; // Permite que a altura se ajuste ao conteúdo
        // Força um repaint para o browser recalcular a altura
        resumePreview.offsetHeight; 

        // Define a escala para o html2canvas
        let html2canvasScale = 4; // Boa escala para PDF de alta qualidade

        html2canvas(resumePreview, {
            scale: html2canvasScale,
            useCORS: true,
            logging: false,
            // scrollY: 0, // Garante que a captura começa do topo
            // windowWidth: resumePreview.scrollWidth, // Garante que a largura da janela de captura é a do elemento
            // windowHeight: resumePreview.scrollHeight, // Garante que a altura da janela de captura é a do elemento
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Largura da página do PDF em mm, sem as margens padrão do jsPDF (0 a getWidth())
            const pdfWidth = pdf.internal.pageSize.getWidth(); 
            // Altura da imagem no PDF, mantendo a proporção original do canvas
            const imgHeight = (canvas.height * pdfWidth) / canvas.width; 

            let position = 0;
            let heightLeft = imgHeight;
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Adiciona a imagem ao PDF, dividindo em páginas se necessário
            while (heightLeft > 0) {
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pageHeight;
                if (heightLeft > 0) {
                    pdf.addPage();
                    position -= pageHeight; // Ajusta a posição para a próxima página
                }
            }

            pdf.save('curriculo.pdf');

        }).catch(error => {
            console.error("Erro ao gerar PDF:", error);
            alert("Ocorreu um erro ao gerar o PDF. Por favor, tente novamente. Se o problema persistir, pode ser um problema de compatibilidade com o seu navegador ou dispositivo.");
        }).finally(() => {
            // Volta a altura do preview para o padrão A4 (297mm) para a visualização no navegador
            resumePreview.style.height = '297mm'; 
        });
    });

    // ---
    // ✅ COMPARTILHAR NO WHATSAPP
    // ---
    document.getElementById('shareWhatsApp').addEventListener('click', function () {
        const whatsappMessage = encodeURIComponent("Confira meu currículo! Você pode baixá-lo no site ou me pedir o arquivo.");
        const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;
        window.open(whatsappUrl, '_blank');
        alert("O compartilhamento de arquivos PDF diretamente via WhatsApp por um link gerado no navegador não é possível. O usuário poderá baixar o PDF e compartilhar manualmente.");
    });


    // ---
    // ✅ LISTENERS PARA AÇÕES PRINCIPAIS
    // ---
    generateResumeButton.addEventListener('click', function (event) {
        event.preventDefault();
        generateResume();
    });

    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Regenera o currículo se o preview estiver visível, mantendo o layout desktop forçado
            if (resumePreview.style.display === 'flex' && resumePreview.classList.contains('force-desktop-layout')) {
                generateResume();
            }
        }, 250);
    });

    // ---
    // ✅ TOOLTIPS
    // ---
    document.querySelectorAll('.info-card').forEach(card => {
        const tooltip = card.querySelector('.tooltip');
        const text = card.dataset.text;
        if (tooltip && text) {
            tooltip.textContent = text;
        }
    });

    // Inicializa a visibilidade do preview para 'none' e remove a classe force-desktop-layout ao carregar a página.
    // A classe será adicionada dinamicamente quando o currículo for gerado.
    resumePreview.style.display = 'none';
    resumePreview.classList.remove('force-desktop-layout'); 
});