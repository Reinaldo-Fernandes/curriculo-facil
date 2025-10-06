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
            };
            reader.readAsDataURL(photoInput.files[0]);
        }
    }
    photoInput.addEventListener('change', previewImage);

    // Contador de caracteres do resumo
    summaryInput.addEventListener('input', function () {
        const charCount = this.value.length;
        summaryCounter.textContent = `${charCount} caracteres`;
    });

    // Funções de adicionar/remover campos
    function setupDynamicField(addButtonId, containerId, templateHtml, inputSelector, fieldName) {
        const addButton = document.getElementById(addButtonId);
        const container = document.getElementById(containerId);
        let itemId = 0;

        addButton.addEventListener('click', function () {
            const newItem = document.createElement('div');
            newItem.classList.add('dynamic-item');
            newItem.setAttribute('data-id', itemId);
            newItem.innerHTML = templateHtml;
            container.appendChild(newItem);

            newItem.querySelector('.remove-button').addEventListener('click', function () {
                container.removeChild(newItem);
                updateProgress();
            });

            newItem.querySelectorAll(inputSelector).forEach(input => {
                input.addEventListener('input', updateProgress);
            });

            itemId++;
            updateProgress();
        });
    }

    // Templates HTML
    const experienceTemplate = `
        <label>Cargo/Título:</label>
        <input type="text" class="experience-title" placeholder="Ex: Desenvolvedor Front-end">
        <label>Empresa:</label>
        <input type="text" class="experience-company" placeholder="Ex: Tech Solutions Ltda">
        <label>Período:</label>
        <input type="text" class="experience-period" placeholder="Ex: Jan 2020 - Dez 2023">
        <label>Descrição:</label>
        <textarea class="experience-description" placeholder="Descreva suas responsabilidades e conquistas."></textarea>
        <button type="button" class="remove-button">Remover Experiência</button>
    `;

    const educationTemplate = `
        <label>Curso/Grau:</label>
        <input type="text" class="education-course" placeholder="Ex: Bacharelado em Ciência da Computação">
        <label>Instituição:</label>
        <input type="text" class="education-institution" placeholder="Ex: Universidade Federal">
        <label>Período:</label>
        <input type="text" class="education-period" placeholder="Ex: 2016 - 2020">
        <button type="button" class="remove-button">Remover Educação</button>
    `;

    const skillTemplate = `
        <label>Habilidade:</label>
        <input type="text" class="skill-name" placeholder="Ex: JavaScript">
        <label>Nível (1-10):</label>
        <input type="number" class="skill-level" min="1" max="10" value="5">
        <button type="button" class="remove-button">Remover Habilidade</button>
    `;

    const languageTemplate = `
        <label>Idioma:</label>
        <input type="text" class="language-name" placeholder="Ex: Inglês">
        <label>Nível:</label>
        <input type="text" class="language-level" placeholder="Ex: Fluente, Intermediário">
        <button type="button" class="remove-button">Remover Idioma</button>
    `;

    setupDynamicField('addExperience', 'experiencesContainer', experienceTemplate, 'input, textarea', 'experiência');
    setupDynamicField('addEducation', 'educationContainer', educationTemplate, 'input', 'educação');
    setupDynamicField('addSkill', 'skillsContainer', skillTemplate, 'input', 'habilidade');
    setupDynamicField('addLanguage', 'languagesContainer', languageTemplate, 'input', 'idioma');

    // Lógica de Preenchimento da barra de progresso
    const requiredFields = [
        nameInput, emailInput, phone1Input, summaryInput
    ];

    function updateProgress() {
        let filledCount = 0;
        const totalFields = requiredFields.length;

        requiredFields.forEach(field => {
            if (field.value.trim() !== '') {
                filledCount++;
            }
        });

        // Contar campos dinâmicos (mínimo de 1 para cada seção, se existir)
        const dynamicSections = [
            { containerId: 'experiencesContainer', min: 1 },
            { containerId: 'educationContainer', min: 1 }
        ];

        let totalDynamicSections = 0;
        let filledDynamicSections = 0;

        dynamicSections.forEach(section => {
            totalDynamicSections += section.min;
            const container = document.getElementById(section.containerId);
            if (container.children.length >= section.min) {
                filledDynamicSections += 1;
            }
        });

        const totalProgressParts = totalFields + totalDynamicSections;
        const currentFilledParts = filledCount + filledDynamicSections;

        const progress = (currentFilledParts / totalProgressParts) * 100;
        progressBar.value = progress;
        progressText.textContent = `${Math.round(progress)}%`;
    }

    // Adiciona evento de input para campos principais
    requiredFields.forEach(field => field.addEventListener('input', updateProgress));

    // Lógica de Geração do Currículo
    function generateResume() {
        const name = nameInput.value || '[Seu Nome Completo]';
        const title = document.getElementById('title').value || '[Seu Título Profissional]';
        const email = emailInput.value || '[Seu E-mail]';
        const phone1 = phone1Input.value || '[Seu Telefone]';
        const phone2 = document.getElementById('phone2').value;
        const linkedin = document.getElementById('linkedin').value;
        const address = document.getElementById('address').value;
        const summary = summaryInput.value || 'Escreva aqui um resumo profissional envolvente, destacando suas principais habilidades e objetivos de carreira. Idealmente, tenha entre 3 e 5 linhas.';
        const photoSrc = photoPreview.src || 'placeholder-photo.jpg';

        let contactInfo = `
            <p><i class="fa-solid fa-envelope"></i> ${email}</p>
            <p><i class="fa-solid fa-phone"></i> ${phone1}</p>
        `;
        if (phone2) contactInfo += `<p><i class="fa-solid fa-mobile-alt"></i> ${phone2}</p>`;
        if (linkedin) contactInfo += `<p><i class="fa-brands fa-linkedin"></i> <a href="${linkedin}" target="_blank">${linkedin.split('/').pop()}</a></p>`;
        if (address) contactInfo += `<p><i class="fa-solid fa-map-marker-alt"></i> ${address}</p>`;

        // Coletar Experiências
        const experiences = Array.from(document.querySelectorAll('#experiencesContainer .dynamic-item')).map(item => ({
            title: item.querySelector('.experience-title').value || 'Cargo/Título',
            company: item.querySelector('.experience-company').value || 'Empresa',
            period: item.querySelector('.experience-period').value || 'Período',
            description: item.querySelector('.experience-description').value || 'Descrição das atividades e resultados.'
        }));

        let experiencesHtml = experiences.map(exp => `
            <div>
                <h4>${exp.title} na ${exp.company}</h4>
                <p><strong>Período:</strong> ${exp.period}</p>
                <p>${exp.description}</p>
            </div>
        `).join('');

        // Coletar Educação
        const education = Array.from(document.querySelectorAll('#educationContainer .dynamic-item')).map(item => ({
            course: item.querySelector('.education-course').value || 'Curso/Grau',
            institution: item.querySelector('.education-institution').value || 'Instituição',
            period: item.querySelector('.education-period').value || 'Período'
        }));

        let educationHtml = education.map(edu => `
            <li>
                <h4>${edu.course}</h4>
                <p>${edu.institution} (${edu.period})</p>
            </li>
        `).join('');

        // Coletar Habilidades
        const skills = Array.from(document.querySelectorAll('#skillsContainer .dynamic-item')).map(item => ({
            name: item.querySelector('.skill-name').value || 'Habilidade',
            level: item.querySelector('.skill-level').value || 5
        }));

        let skillsHtml = skills.map(skill => `
            <li>${skill.name} (Nível: ${skill.level}/10)</li>
        `).join('');

        // Coletar Idiomas
        const languages = Array.from(document.querySelectorAll('#languagesContainer .dynamic-item')).map(item => ({
            name: item.querySelector('.language-name').value || 'Idioma',
            level: item.querySelector('.language-level').value || 'Nível'
        }));

        let languagesHtml = languages.map(lang => `
            <li>${lang.name} (${lang.level})</li>
        `).join('');

        // Coletar Atividades (outros campos)
        const activities = document.getElementById('activities').value;
        const activitiesHtml = activities ? `
            <section class="other-activities">
                <h3><i class="fa-solid fa-ellipsis"></i> ATIVIDADES E INTERESSES</h3>
                <p>${activities}</p>
            </section>
        ` : '';

        // Montagem final do HTML
        resumePreview.innerHTML = `
            <div class="resume-left custom-bg-color">
                <img id="previewPhoto" src="${photoSrc}" alt="Sua Foto">
                <h2>${name}</h2>
                <p style="text-align: center;">${title}</p>
                
                <h3><i class="fa-solid fa-user"></i> PERFIL</h3>
                <p class="summary">${summary}</p>

                <h3><i class="fa-solid fa-phone-volume"></i> CONTATO</h3>
                <div class="contact-info">${contactInfo}</div>

                <h3><i class="fa-solid fa-tools"></i> HABILIDADES</h3>
                <div class="skills-display"><ul>${skillsHtml}</ul></div>

                <h3><i class="fa-solid fa-language"></i> IDIOMAS</h3>
                <div class="languages-display"><ul>${languagesHtml}</ul></div>
            </div>
            <div class="resume-right">
                <section class="experience-section">
                    <h3><i class="fa-solid fa-briefcase"></i> EXPERIÊNCIA PROFISSIONAL</h3>
                    ${experiencesHtml || '<p>Preencha sua experiência profissional para esta seção aparecer.</p>'}
                </section>

                <section class="education-section">
                    <h3><i class="fa-solid fa-graduation-cap"></i> EDUCAÇÃO</h3>
                    <ul>${educationHtml || '<li>Preencha sua formação acadêmica para esta seção aparecer.</li>'}</ul>
                </section>
                
                ${activitiesHtml}
            </div>
        `;
        updateProgress();
    }

    generateResumeButton.addEventListener('click', function (event) {
        event.preventDefault();
        generateResume();
    });

    // 🚩 CÓDIGO CORRIGIDO: Botão baixar PDF com suporte a múltiplas páginas e layout A4
    downloadPdfBtn.addEventListener('click', function (event) {
        event.preventDefault();

        generateResume();

        // 1. Clonamos o preview para garantir que o html2canvas capture o layout A4
        const previewClone = resumePreview.cloneNode(true);
        previewClone.style.width = '210mm';
        previewClone.style.minWidth = '210mm';
        previewClone.style.maxWidth = '210mm';
        previewClone.style.height = 'auto'; // Captura todo o conteúdo
        // Adiciona fora da tela para evitar flash visual
        previewClone.style.position = 'fixed'; 
        previewClone.style.top = '-9999px'; 

        document.body.appendChild(previewClone); // Adiciona ao DOM (temporariamente)

        html2canvas(previewClone, {
            scale: 5,          // qualidade da imagem
            useCORS: true,     // permite imagens externas
            logging: false     // desativa logs no console
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth(); // 210 mm
            const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm
            
            // 2. Calcula a proporção correta para caber na página A4
            const imgProps = pdf.getImageProperties(imgData);
            const imgWidth = pdfWidth; // Imagem ocupa a largura total do A4 (210mm)
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width; // Altura calculada pela proporção

            // 3. Verifica se a imagem é maior que uma página A4 e usa um plugin multipágina se necessário
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            // Lógica para adicionar páginas se o currículo for muito longo
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
             document.body.removeChild(previewClone); // Remove o clone após a captura
        });
    });

    // Inicializa preview vazio
    generateResume();
    updateProgress();
});