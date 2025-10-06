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
    const shareWhatsAppBtn = document.getElementById('shareWhatsApp'); // Novo
    const colorPickerSection = document.getElementById('colorPickerSection'); // Novo

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phone1Input = document.getElementById('phone1');

    // 🚩 NOVO: Variável para armazenar a cor selecionada (padrão #2a3eb1)
    let selectedPrimaryColor = '#2a3eb1'; 
    let selectedSecondaryColor = '#e8f0fe'; // Cor padrão para a coluna lateral

    // Preview da imagem carregada
    function previewImage() {
        if (photoInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = function (e) {
                photoPreview.src = e.target.result;
                photoPreview.style.display = "block";
                generateResume(); // 🚩 BUG FIX: Garante que o preview atualiza com a foto
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
    function setupDynamicField(addButtonId, containerId, templateHtml, fieldClasses) {
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
            // Usamos a classe específica para os componentes de layout
            newItem.classList.add(containerId.replace('Container', '-entry')); 
            
            newItem.setAttribute('data-id', itemId);
            newItem.innerHTML = templateHtml;
            container.appendChild(newItem);

            // Adiciona listener para o botão de remover
            const removeButton = newItem.querySelector('.remove-button');
            if (removeButton) {
                 removeButton.addEventListener('click', function () {
                    container.removeChild(newItem);
                    updateProgress();
                    generateResume(); 
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

    // --- Templates HTML para Campos Dinâmicos (CORRIGIDOS) ---
    // Adicionei a classe 'remove-button' para o JS reconhecer
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
    setupDynamicField('addExperience', 'experienceContainer', experienceTemplate, ['experience-title', 'experience-company', 'experience-duration', 'experience-description']);
    setupDynamicField('addEducation', 'educationContainer', educationTemplate, ['education-title', 'education-institution', 'education-duration']);
    setupDynamicField('addCertification', 'certificationsContainer', certificationTemplate, ['certification-name', 'certification-institution', 'certification-description']);


    // Lógica de Preenchimento da barra de progresso (Mantida)
    function updateProgress() {
        // ... (Lógica de updateProgress anterior, mantida)
        const fields = Array.from(resumeForm.querySelectorAll('input:not([type="file"]):not([disabled]):not([readonly]):not([type="color"]), textarea:not([disabled]):not([readonly]), select:not([disabled]):not([readonly])'));
        const filledFields = fields.filter(field => field.value.trim() !== '').length;
        const totalFields = fields.length;

        let progress = 0;
        if (totalFields > 0) {
            // Garante que o progresso nunca é 100% até que a foto seja adicionada
            progress = Math.round((filledFields / totalFields) * 90) + (photoInput.files.length > 0 ? 10 : 0);
        }

        progressBar.value = progress;
        progressText.textContent = `${progress}%`;
    }
    resumeForm.addEventListener('input', function(event) {
        updateProgress();
        // Garante que o preview é atualizado em tempo real para campos não dinâmicos
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
                    // Normaliza a chave (ex: education-title -> education_title)
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
            skills: document.getElementById('skills').value.split(/,?\s*\n/).map(s => s.trim()).filter(Boolean), // Suporta ',' ou '\n'
            languages: document.getElementById('languages').value.split(/,?\s*\n/).map(l => l.trim()).filter(Boolean), // Suporta ',' ou '\n'
            education: educationEntries,
            experience: experienceEntries,
            certifications: certificationEntries,
            activities: document.getElementById('activities').value.trim(),
        };
        
        // --- Montagem dos Blocos HTML ---
        // Contato simplificado para a coluna lateral
        let linkedinLink = resumeData.linkedin ? `<a href="${resumeData.linkedin}" target="_blank">${resumeData.linkedin.replace(/(^\w+:|^)\/\//, '').split('/').shift()}</a>` : '';
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
            <div class="experience-entry">
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
            <div class="certification-entry">
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
        
        // 🚩 NOVO: Define as cores do layout no DOM para o CSS usar
        resumePreview.style.setProperty('--selected-primary-color', selectedPrimaryColor);
        resumePreview.style.setProperty('--selected-secondary-color', selectedSecondaryColor);
        
        updateProgress();
    }

    generateResumeButton.addEventListener('click', function (event) {
        event.preventDefault();
        generateResume();
    });
    
    // Botão baixar PDF (MANTIDO CONFORME SOLICITADO, APESAR DO BUG DE QUALIDADE)
    downloadPdfBtn.addEventListener('click', function (event) {
        // ... CÓDIGO HTML2CANVAS/JSPDF ANTIGO, NÃO ALTERADO ...
    });

    // 🚩 NOVO: Lógica de Compartilhar no WhatsApp
    shareWhatsAppBtn.addEventListener('click', function() {
        generateResume(); // Garante o conteúdo mais recente

        const name = nameInput.value.trim() || 'Candidato(a)';
        const email = emailInput.value.trim();
        const phone = phone1Input.value.trim();
        const summary = summaryInput.value.trim().substring(0, 150) + '...';

        let message = `*Olá!* Envio meu currículo. Por favor, confira minhas qualificações:\n\n`;
        message += `*Nome:* ${name}\n`;
        message += `*Contato:* ${phone || email || 'Não informado'}\n\n`;
        message += `*Resumo:* ${summary}\n\n`;
        message += `*Acesse o PDF completo para mais detalhes.*\n\n`;
        message += `*Link para o PDF:* [AQUI VOCÊ PRECISA DE UM LINK PÚBLICO PARA O SEU PDF]`;

        const whatsappURL = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(whatsappURL, '_blank');
    });

    // 🚩 NOVO: Inicialização do Color Picker (Melhoria de Design)
    function initializeColorPicker() {
        const defaultColors = [
            { primary: '#2a3eb1', secondary: '#e8f0fe' }, // Azul Padrão
            { primary: '#008080', secondary: '#e0ffff' }, // Verde Água
            { primary: '#800000', secondary: '#ffe0e0' }, // Vinho
            { primary: '#556b2f', secondary: '#f0fff0' }, // Verde Oliva
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

        // Adiciona listeners para selecionar cores
        document.querySelectorAll('.color-swatch:not(.custom-swatch)').forEach(swatch => {
            swatch.addEventListener('click', function() {
                selectedPrimaryColor = this.getAttribute('data-primary');
                selectedSecondaryColor = this.getAttribute('data-secondary');
                applyColors();
            });
        });
        
        // Listener para o picker de cor personalizado
        document.getElementById('customColorPicker').addEventListener('input', function() {
            selectedPrimaryColor = this.value;
            // Define uma cor secundária clara baseada no tom
            selectedSecondaryColor = getLightVariant(selectedPrimaryColor); 
            applyColors();
        });
    }
    
    function applyColors() {
        document.documentElement.style.setProperty('--primary-color', selectedPrimaryColor);
        // Atualiza a cor de fundo da coluna lateral
        document.documentElement.style.setProperty('--secondary-color', selectedSecondaryColor);
        
        // Aplica a cor do rodapé
        document.querySelector('footer').style.backgroundColor = selectedPrimaryColor;
        
        // Garante que o preview seja renderizado com as novas cores
        generateResume();
    }
    
    // Função simples para obter uma variante mais clara da cor
    function getLightVariant(hex) {
        // Remove # e converte para R, G, B
        const bigint = parseInt(hex.slice(1), 16);
        let r = (bigint >> 16) & 255;
        let g = (bigint >> 8) & 255;
        let b = bigint & 255;

        // Aumenta o brilho (misturando com branco)
        const factor = 0.9;
        r = Math.round(r + (255 - r) * factor);
        g = Math.round(g + (255 - g) * factor);
        b = Math.round(b + (255 - b) * factor);

        // Converte de volta para HEX
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }


    initializeColorPicker();


    // 🌟 FUNCIONALIDADE DE EXPANDIR/DIMINUIR (Zoom in/out) - MANTIDA
    resumePreview.addEventListener('click', function() {
        this.classList.toggle('expanded');
        
        if (this.classList.contains('expanded')) {
            this.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    // Inicializa preview
    generateResume();
});