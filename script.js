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
    const shareWhatsAppBtn = document.getElementById('shareWhatsApp'); 
    const colorPickerSection = document.getElementById('colorPickerSection');

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phone1Input = document.getElementById('phone1');

    // VARIÁVEIS DE COR
    let selectedPrimaryColor = '#2a3eb1'; 
    let selectedSecondaryColor = '#e8f0fe'; 

    // Preview da imagem carregada
    function previewImage() {
        if (photoInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = function (e) {
                photoPreview.src = e.target.result;
                photoPreview.style.display = "block";
                generateResume(); 
            };
            reader.readAsDataURL(photoInput.files[0]);
        }
    }
    photoInput.addEventListener('change', previewImage);

    // Contador de caracteres do resumo
    summaryInput.addEventListener('input', function () {
        const maxLength = 600;
        const currentLength = summaryInput.value.length;

        if (currentLength > maxLength) {
            summaryInput.value = summaryInput.value.substring(0, maxLength);
        }
        summaryCounter.textContent = `${summaryInput.value.length} / ${maxLength} caracteres`;
        generateResume(); 
    });

    // Função robusta para configurar campos dinâmicos (Experiência, Educação, Certificações)
    function setupDynamicField(addButtonId, containerId, templateHtml) {
        const addButton = document.getElementById(addButtonId);
        const container = document.getElementById(containerId);
        let itemId = 0;

        if (!addButton || !container) return;

        addButton.addEventListener('click', function () {
            const newItem = document.createElement('div');
            newItem.classList.add('dynamic-item');
            newItem.classList.add(containerId.replace('Container', '-entry')); 
            
            newItem.setAttribute('data-id', itemId);
            newItem.innerHTML = templateHtml;
            container.appendChild(newItem);

            const removeButton = newItem.querySelector('.remove-button');
            if (removeButton) {
                 removeButton.addEventListener('click', function () {
                    container.removeChild(newItem);
                    updateProgress();
                    generateResume(); 
                });
            }

            newItem.querySelectorAll('input, textarea').forEach(input => {
                input.addEventListener('input', function() {
                    updateProgress();
                    generateResume(); 
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
        const fields = Array.from(resumeForm.querySelectorAll('input:not([type="file"]):not([disabled]):not([readonly]):not([type="color"]), textarea:not([disabled]):not([readonly]), select:not([disabled]):not([readonly])'));
        const filledFields = fields.filter(field => field.value.trim() !== '').length;
        const totalFields = fields.length;

        let progress = 0;
        if (totalFields > 0) {
            progress = Math.round((filledFields / totalFields) * 90) + (photoInput.files.length > 0 ? 10 : 0);
        }

        progressBar.value = progress;
        progressText.textContent = `${progress}%`;
    }
    resumeForm.addEventListener('input', function(event) {
        updateProgress();
        if (!event.target.closest('.dynamic-item') && event.target.id !== 'photo') {
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
            skills: document.getElementById('skills').value.split(/,?\s*\n/).map(s => s.trim()).filter(Boolean), 
            languages: document.getElementById('languages').value.split(/,?\s*\n/).map(l => l.trim()).filter(Boolean), 
            education: educationEntries,
            experience: experienceEntries,
            certifications: certificationEntries,
            activities: document.getElementById('activities').value.trim(),
        };
        
        // 🚩 Lógica de Formatação do Nome (Sua Solicitação)
        const fullName = resumeData.name;
        const nameParts = fullName.split(' ').filter(Boolean);
        let nameLine1 = fullName;
        let nameLine2 = '';

        if (nameParts.length >= 2) {
            // Pega o Nome e o Sobrenome (os dois primeiros)
            nameLine1 = `${nameParts[0]} ${nameParts[1]}`;
            // Pega o restante do nome
            nameLine2 = nameParts.slice(2).join(' ');
        }
        
        let nameHtml = `<h2 class="name-line-1">${nameLine1}</h2>`;
        if (nameLine2) {
            nameHtml += `<h3 class="name-line-2">${nameLine2}</h3>`;
        }

        // --- Montagem dos Blocos HTML ---
        let linkedinUrl = resumeData.linkedin.startsWith('http') ? resumeData.linkedin : (resumeData.linkedin ? `https://${resumeData.linkedin}` : '');
        let linkedinLink = resumeData.linkedin ? `<a href="${linkedinUrl}" target="_blank">${resumeData.linkedin.replace(/(^\w+:|^)\/\//, '').split('/').shift()}</a>` : '';
        let contactInfo = `
            ${resumeData.email ? `<p><i class="fa-solid fa-envelope"></i> ${resumeData.email}</p>` : ''}
            ${resumeData.phone1 ? `<p><i class="fa-solid fa-phone"></i> ${resumeData.phone1}</p>` : ''}
            ${resumeData.phone2 ? `<p><i class="fa-solid fa-mobile-alt"></i> ${resumeData.phone2}</p>` : ''}
            ${linkedinLink ? `<p><i class="fa-brands fa-linkedin"></i> ${linkedinLink}</p>` : ''}
            ${resumeData.address ? `<p><i class="fa-solid fa-map-marker-alt"></i> ${resumeData.address}</p>` : ''}
        `;

        let skillsHtml = resumeData.skills.map(s => `<li>${s}</li>`).join('');
        let languagesHtml = resumeData.languages.map(l => `<li>${l}</li>`).join('');
        
        let experiencesHtml = resumeData.experience.map(exp => `
            <div class="experience-entry entry-item">
                <h4>${exp.experience_title} na ${exp.experience_company}</h4>
                <p><strong>Período:</strong> ${exp.experience_duration}</p>
                <p>${exp.experience_description}</p>
            </div>
        `).join('');

        let educationHtml = resumeData.education.map(edu => `
            <li class="entry-item">
                <h4>${edu.education_title}</h4>
                <p>${edu.education_institution} (${edu.education_duration})</p>
            </li>
        `).join('');

        let certificationsHtml = resumeData.certifications.map(cert => `
            <div class="certification-entry entry-item">
                <h4>${cert.certification_name}</h4>
                <p>${cert.certification_institution} (${cert.certification_description})</p>
            </div>
        `).join('');

        const certificationsSection = certificationsHtml ? `
            <section class="certifications-section">
                <h3><i class="fa-solid fa-award"></i> CERTIFICAÇÕES</h3>
                ${certificationsHtml}
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
                ${nameHtml} ${contactInfo.trim() ? `
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
        
        // Aplica as cores selecionadas
        applyColors();
        
        updateProgress();
    }

    generateResumeButton.addEventListener('click', function (event) {
        event.preventDefault();
        generateResume();
    });
    
    // 🚩 CORREÇÃO DO BUG: Lógica de download usando html2pdf.js
    downloadPdfBtn.addEventListener('click', function (event) {
        event.preventDefault();

        generateResume(); // Garante que o preview está com o conteúdo mais recente
        
        // Cria um clone do preview para isolar o elemento A4 do restante da página
        const originalElement = document.getElementById('resumePreview');
        const elementClone = originalElement.cloneNode(true);
        elementClone.classList.add('pdf-output'); // Adiciona classe para possíveis ajustes de estilo

        // Adiciona o clone temporariamente ao body para garantir a renderização correta
        document.body.appendChild(elementClone);

        // Configurações do html2pdf
        const opt = {
            margin: [10, 10, 10, 10], // Margens (Topo, Direita, Rodapé, Esquerda) em mm
            filename: 'curriculo_profissional.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 3, logging: false }, 
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: 'css' } // Usa as regras CSS de 'page-break-inside: avoid'
        };
        
        // Usa o html2pdf para gerar e baixar
        if (typeof html2pdf !== 'undefined') {
             html2pdf().set(opt).from(elementClone).save().finally(() => {
                 // Remove o clone após a conclusão
                 document.body.removeChild(elementClone);
             });
        } else {
             alert("Erro: A biblioteca html2pdf não foi carregada. Verifique o arquivo index.html.");
             document.body.removeChild(elementClone);
        }
    });

    // Lógica de Compartilhar no WhatsApp
    shareWhatsAppBtn.addEventListener('click', function() {
        generateResume(); 
        const name = nameInput.value.trim() || 'Candidato(a)';
        const email = emailInput.value.trim();
        const phone = phone1Input.value.trim();
        const summary = summaryInput.value.trim().substring(0, 150) + '...';

        let message = `*Olá!* Envio meu currículo. Por favor, confira minhas qualificações:\n\n`;
        message += `*Nome:* ${name}\n`;
        message += `*Contato:* ${phone || email || 'Não informado'}\n\n`;
        message += `*Resumo:* ${summary}\n\n`;
        message += `*Lembrete:* Você precisará hospedar o arquivo PDF em um serviço de nuvem (como Google Drive ou Dropbox) para compartilhar um link direto.`;

        const whatsappURL = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(whatsappURL, '_blank');
    });

    // Inicialização do Color Picker
    function initializeColorPicker() {
        const defaultColors = [
            { primary: '#2a3eb1', secondary: '#e8f0fe' }, 
            { primary: '#008080', secondary: '#e0ffff' }, 
            { primary: '#800000', secondary: '#ffe0e0' }, 
            { primary: '#556b2f', secondary: '#f0fff0' }, 
        ];

        let html = `
            <h3><i class="fa-solid fa-palette"></i> Personalizar Cores</h3>
            <p>Escolha a cor principal para a coluna lateral e títulos:</p>
            <div class="color-options">
        `;
        
        defaultColors.forEach(color => {
            html += `
                <div class="color-swatch" style="background-color: ${color.primary};" 
                     data-primary="${color.primary}" 
                     data-secondary="${color.secondary}">
                </div>
            `;
        });
        
        html += `
            <div class="color-swatch custom-swatch" title="Escolher cor personalizada">
                <input type="color" id="customColorPicker" value="${selectedPrimaryColor}">
            </div>
            </div>
        `;
        colorPickerSection.innerHTML = html;

        document.querySelectorAll('.color-swatch:not(.custom-swatch)').forEach(swatch => {
            swatch.addEventListener('click', function() {
                selectedPrimaryColor = this.getAttribute('data-primary');
                selectedSecondaryColor = this.getAttribute('data-secondary');
                applyColors();
            });
        });
        
        document.getElementById('customColorPicker').addEventListener('input', function() {
            selectedPrimaryColor = this.value;
            selectedSecondaryColor = getLightVariant(selectedPrimaryColor); 
            applyColors();
        });
        
        applyColors(); // Aplica as cores padrão na inicialização
    }
    
    function applyColors() {
        // Atualiza variáveis CSS Root para que o CSS do Preview use-as
        document.documentElement.style.setProperty('--primary-color', selectedPrimaryColor);
        document.documentElement.style.setProperty('--secondary-color', selectedSecondaryColor);
        
        // Aplica a cor do rodapé
        const footer = document.querySelector('footer');
        if (footer) footer.style.backgroundColor = selectedPrimaryColor;
        
        // Força a atualização do preview com as novas cores
        resumePreview.style.setProperty('--selected-primary-color', selectedPrimaryColor);
        resumePreview.style.setProperty('--selected-secondary-color', selectedSecondaryColor);
        
        generateResume();
    }
    
    // Calcula uma variante clara de uma cor hexadecimal
    function getLightVariant(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        let r = (bigint >> 16) & 255;
        let g = (bigint >> 8) & 255;
        let b = bigint & 255;
        const factor = 0.9; 
        r = Math.round(r + (255 - r) * factor);
        g = Math.round(g + (255 - g) * factor);
        b = Math.round(b + (255 - b) * factor);
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }


    initializeColorPicker();


    // FUNCIONALIDADE DE EXPANDIR/DIMINUIR (Zoom in/out)
    resumePreview.addEventListener('click', function() {
        this.classList.toggle('expanded');
        
        if (this.classList.contains('expanded')) {
            this.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    // Inicializa preview
    generateResume();
});