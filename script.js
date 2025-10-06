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
                generateResume(); // Atualiza o preview após o upload da foto
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
        generateResume(); // Atualiza o preview em tempo real
    });

    // Função robusta para configurar campos dinâmicos (Experiência, Educação, Certificações)
    function setupDynamicField(addButtonId, containerId, templateHtml) {
        const addButton = document.getElementById(addButtonId);
        const container = document.getElementById(containerId);
        let itemId = 0;

        if (!addButton || !container) {
            console.error(`Erro: O botão com ID '${addButtonId}' ou o container com ID '${containerId}' não foi encontrado.`);
            return;
        }

        addButton.addEventListener('click', function () {
            const newItem = document.createElement('div');
            newItem.classList.add('dynamic-item');
            newItem.setAttribute('data-id', itemId);
            newItem.innerHTML = templateHtml;
            container.appendChild(newItem);

            // Adiciona listener para o botão de remover
            const removeButton = newItem.querySelector('.remove-button');
            if (removeButton) {
                 removeButton.addEventListener('click', function () {
                    container.removeChild(newItem);
                    updateProgress();
                    generateResume(); // Atualiza o preview ao remover
                });
            }

            // Adiciona listeners para os inputs dentro do novo item
            newItem.querySelectorAll('input, textarea').forEach(input => {
                input.addEventListener('input', function() {
                    updateProgress();
                    generateResume(); // Atualiza o preview em tempo real
                });
            });

            itemId++;
            updateProgress();
            generateResume();
        });
    }

    // --- Templates HTML para Campos Dinâmicos ---
    const experienceTemplate = `
        <div class="experience-entry entry">
            <label>Cargo/Título:</label>
            <input type="text" class="experience-title" placeholder="Ex: Desenvolvedor Front-end">
            <label>Empresa:</label>
            <input type="text" class="experience-company" placeholder="Ex: Tech Solutions Ltda">
            <label>Período:</label>
            <input type="text" class="experience-duration" placeholder="Ex: Jan 2020 - Dez 2023">
            <label>Descrição:</label>
            <textarea class="experience-description" placeholder="Descreva suas responsabilidades e conquistas."></textarea>
            <button type="button" class="remove-button">Remover Experiência</button>
        </div>
    `;

    const educationTemplate = `
        <div class="education-entry entry">
            <label>Curso/Grau:</label>
            <input type="text" class="education-title" placeholder="Ex: Bacharelado em Ciência da Computação">
            <label>Instituição:</label>
            <input type="text" class="education-institution" placeholder="Ex: Universidade Federal">
            <label>Período:</label>
            <input type="text" class="education-duration" placeholder="Ex: 2016 - 2020">
            <button type="button" class="remove-button">Remover Educação</button>
        </div>
    `;

    const certificationTemplate = `
        <div class="certification-entry entry">
            <label>Nome da Certificação:</label>
            <input type="text" class="certification-name" placeholder="Ex: AWS Certified Cloud Practitioner">
            <label>Instituição Emissora:</label>
            <input type="text" class="certification-institution" placeholder="Ex: Amazon Web Services">
            <label>Descrição:</label>
            <textarea class="certification-description" placeholder="Ex: Foco em serviços de computação em nuvem."></textarea>
            <button type="button" class="remove-button">Remover Certificação</button>
        </div>
    `;

    // --- Configuração dos Campos Dinâmicos ---
    setupDynamicField('addExperience', 'experienceContainer', experienceTemplate);
    setupDynamicField('addEducation', 'educationContainer', educationTemplate);
    setupDynamicField('addCertification', 'certificationsContainer', certificationTemplate);


    // Lógica de Preenchimento da barra de progresso 
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
    resumeForm.addEventListener('input', function(event) {
        updateProgress();
        // Garante que o preview é atualizado em tempo real para campos não dinâmicos
        if (!event.target.closest('.dynamic-item')) {
            generateResume();
        }
    });

    updateProgress();

    // Função para capturar dados dos campos dinâmicos
    function getDynamicEntries(containerId, fieldClasses) {
        const container = document.getElementById(containerId);
        if (!container) return [];
        const entries = Array.from(container.querySelectorAll('.dynamic-item'));
        return entries.map(entry => {
            const data = {};
            fieldClasses.forEach(cls => {
                const element = entry.querySelector(`.${cls}`);
                if (element) {
                    const key = cls.replace(/-/g, '_');
                    data[key] = element.value.trim();
                }
            });
            // Filtra entradas vazias no bloco, mas não remove se houver pelo menos um valor
            return data;
        }).filter(data => Object.values(data).some(value => value !== ''));
    }


    // Gera dados do currículo e atualiza preview HTML
    function generateResume() {
        errorMessageDiv.style.display = "none";
        resumePreview.style.display = "flex";
        resumePreview.style.opacity = "1";

        const photoFound = photoPreview.src && photoPreview.src !== window.location.href && photoPreview.style.display !== 'none';
        let imageUrl = photoFound ? `<img id="previewPhoto" src='${photoPreview.src}' alt='Foto do Candidato' />` : '';

        // --- Coleta de Dados ---
        const educationEntries = getDynamicEntries('educationContainer', ['education-title', 'education-institution', 'education-duration']);
        const experienceEntries = getDynamicEntries('experienceContainer', ['experience-title', 'experience-company', 'experience-duration', 'experience-description']);
        const certificationEntries = getDynamicEntries('certificationsContainer', ['certification-name', 'certification-institution', 'certification-description']);

        const resumeData = {
            name: nameInput.value.trim() || 'Seu Nome Completo',
            address: document.getElementById('address').value.trim(),
            email: emailInput.value.trim() || 'seu.email@exemplo.com',
            phone1: phone1Input.value.trim() || '(99) 99999-9999',
            phone2: document.getElementById('phone2').value.trim(),
            linkedin: document.getElementById('linkedin').value.trim(),
            summary: summaryInput.value.trim() || 'Escreva aqui um resumo profissional envolvente, destacando suas principais habilidades e objetivos de carreira.',
            skills: document.getElementById('skills').value.split(',').map(s => s.trim()).filter(Boolean),
            languages: document.getElementById('languages').value.split('\n').map(l => l.trim()).filter(Boolean), // Suporta quebra de linha
            education: educationEntries,
            experience: experienceEntries,
            certifications: certificationEntries,
            activities: document.getElementById('activities').value.trim(),
        };
        
        // --- Montagem dos Blocos HTML ---
        // Contato simplificado para a coluna lateral
        let contactInfo = `
            ${resumeData.email ? `<p><i class="fa-solid fa-envelope"></i> ${resumeData.email}</p>` : ''}
            ${resumeData.phone1 ? `<p><i class="fa-solid fa-phone"></i> ${resumeData.phone1}</p>` : ''}
            ${resumeData.phone2 ? `<p><i class="fa-solid fa-mobile-alt"></i> ${resumeData.phone2}</p>` : ''}
            ${resumeData.linkedin ? `<p><i class="fa-brands fa-linkedin"></i> <a href="${resumeData.linkedin}" target="_blank">${resumeData.linkedin.split('/').pop() || 'LinkedIn'}</a></p>` : ''}
            ${resumeData.address ? `<p><i class="fa-solid fa-map-marker-alt"></i> ${resumeData.address}</p>` : ''}
        `;

        let skillsHtml = resumeData.skills.map(s => `<li>${s}</li>`).join('');
        let languagesHtml = resumeData.languages.map(l => `<li>${l}</li>`).join('');
        
        let experiencesHtml = resumeData.experience.map(exp => `
            <div>
                <h4>${exp.experience_title} na ${exp.experience_company}</h4>
                <p><strong>Período:</strong> ${exp.experience_duration}</p>
                <p>${exp.experience_description}</p>
            </div>
        `).join('');

        let educationHtml = resumeData.education.map(edu => `
            <li>
                <h4>${edu.education_title}</h4>
                <p>${edu.education_institution} (${edu.education_duration})</p>
            </li>
        `).join('');

        let certificationsHtml = resumeData.certifications.map(cert => `
            <li>
                <h4>${cert.certification_name}</h4>
                <p>${cert.certification_institution} (${cert.certification_description})</p>
            </li>
        `).join('');

        const certificationsSection = certificationsHtml ? `
            <section class="certifications-section">
                <h3><i class="fa-solid fa-award"></i> CERTIFICAÇÕES</h3>
                <ul>${certificationsHtml}</ul>
            </section>
        ` : '';

        const activitiesHtml = resumeData.activities ? `
            <section class="other-activities">
                <h3><i class="fa-solid fa-school-circle-exclamation"></i> ATIVIDADES EXTRACURRICULARES</h3>
                <p>${resumeData.activities}</p>
            </section>
        ` : '';


        // --- Montagem final do HTML no Preview ---
        resumePreview.innerHTML = `
            <div class="resume-left custom-bg-color">
                ${imageUrl}
                <h2>${resumeData.name}</h2>
                
                ${contactInfo.trim() ? `
                    <h3><i class="fa-solid fa-phone-volume"></i> CONTATO</h3>
                    <div class="contact-info">${contactInfo}</div>
                ` : ''}

                ${skillsHtml ? `
                    <h3><i class="fa-solid fa-tools"></i> HABILIDADES</h3>
                    <div class="skills-display"><ul>${skillsHtml}</ul></div>
                ` : ''}

                ${languagesHtml ? `
                    <h3><i class="fa-solid fa-language"></i> IDIOMAS</h3>
                    <div class="languages-display"><ul>${languagesHtml}</ul></div>
                ` : ''}
            </div>
            <div class="resume-right">
                <section class="summary-section">
                    <h3><i class="fa-solid fa-user"></i> RESUMO PROFISSIONAL</h3>
                    <p class="summary-text">${resumeData.summary}</p>
                </section>
                <section class="experience-section">
                    <h3><i class="fa-solid fa-briefcase"></i> EXPERIÊNCIA PROFISSIONAL</h3>
                    ${experiencesHtml || '<p>Preencha sua experiência profissional para esta seção aparecer.</p>'}
                </section>

                <section class="education-section">
                    <h3><i class="fa-solid fa-graduation-cap"></i> EDUCAÇÃO</h3>
                    <ul>${educationHtml || '<li>Preencha sua formação acadêmica para esta seção aparecer.</li>'}</ul>
                </section>
                
                ${certificationsSection} 
                ${activitiesHtml}
            </div>
        `;
        updateProgress();
    }

    generateResumeButton.addEventListener('click', function (event) {
        event.preventDefault();
        generateResume();
    });

    // 🚩 CÓDIGO FINAL CORRIGIDO: Botão baixar PDF com suporte a múltiplas páginas e layout A4
    downloadPdfBtn.addEventListener('click', function (event) {
        event.preventDefault();

        generateResume(); // Garante que o preview está atualizado

        // 1. Clonamos o preview para garantir que o html2canvas capture o layout A4
        const previewClone = resumePreview.cloneNode(true);
        previewClone.style.width = '210mm';
        previewClone.style.minWidth = '210mm';
        previewClone.style.maxWidth = '210mm';
        previewClone.style.height = 'auto'; 
        previewClone.style.position = 'fixed'; 
        previewClone.style.top = '-9999px'; 

        document.body.appendChild(previewClone);

        html2canvas(previewClone, {
            scale: 5,         
            useCORS: true,     
            logging: false     
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const imgProps = pdf.getImageProperties(imgData);
            const imgWidth = pdfWidth;
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft >= -1) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save('curriculo.pdf');
        }).catch(error => {
            console.error("Erro ao gerar PDF:", error);
            alert("Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.");
        }).finally(() => {
             document.body.removeChild(previewClone); 
        });
    });

    // 🌟 NOVA FUNCIONALIDADE: Expandir/Diminuir o preview A4 em dispositivos móveis 
    // Garante que só acontece em telas menores
    if (window.innerWidth <= 950) { 
        resumePreview.addEventListener('click', function() {
            // Alterna a classe 'expanded'
            this.classList.toggle('expanded');
            
            // Altera o cursor para indicar a próxima ação
            if (this.classList.contains('expanded')) {
                this.style.cursor = 'zoom-out';
            } else {
                this.style.cursor = 'zoom-in';
            }
            
            // Opcional: Rolagem para o topo do preview ao expandir
            this.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    // Inicializa preview
    generateResume();
});