/**
 * script.js - Versão corrigida e completa
 * - Proteções contra null/undefined
 * - CORREÇÕES SOLICITADAS:
 * 1. Otimizada a lógica de download de PDF para eliminar a página em branco (versão do usuário).
 * 2. Corrigida a lógica de renderização da seção 'Contato' (e seu cabeçalho) para que não apareça se todos os campos estiverem vazios.
 * 3. Aplicados limites de caracteres (500 para resumo, 200 para atividades e responsabilidades).
 */

document.addEventListener('DOMContentLoaded', async () => {

    /* -------------------- Variáveis e DOM -------------------- */
    let selectedPrimaryColor = '#2a3eb1';
    let selectedSecondaryColor = '#e8f0fe';

    const resumePreview = document.getElementById('resumePreview');
    // Renomeando para evitar conflito com a função de download direto
    const previewButton = document.getElementById('generateResumeButton'); 
    const downloadPdfBtn = document.getElementById('downloadPdf');

    const photoInput = document.getElementById('photo');
    const croppieContainer = document.getElementById('croppie-container');

    const colorPickerSection = document.getElementById('colorPickerSection');

    const summaryInput = document.getElementById('summary');
    const summaryCounter = document.getElementById('summaryCounter');

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phone1Input = document.getElementById('phone1');
    const skillsInput = document.getElementById('skills');
    const languagesInput = document.getElementById('languages');
    const activitiesInput = document.getElementById('activities');
    const addressInput = document.getElementById('address');
    const linkedinInput = document.getElementById('linkedin');
    // REMOVIDOS: gitHubInput e titleInput

    const educationContainer = document.getElementById('educationContainer');
    const addEducationBtn = document.getElementById('addEducationBtn');
    const experienceContainer = document.getElementById('experienceContainer');
    const addExperienceBtn = document.getElementById('addExperienceBtn');
    const certificationContainer = document.getElementById('certificationContainer');
    const addCertificationBtn = document.getElementById('addCertificationBtn');

    const templateRadioButtons = document.querySelectorAll('input[name="template"]'); 
    const hidePhotoCheckbox = document.getElementById('hidePhoto');

    let templateId = 'template-modelo1';
    let croppieInstance;
    let photoDataURL = null;

    /* -------------------- Funções de Ajuda -------------------- */
    
    // NOVO: Função para limitar o número de caracteres
    function limitCharacterCount(inputElement, maxChars) {
        if (inputElement && inputElement.value.length > maxChars) {
            inputElement.value = inputElement.value.substring(0, maxChars);
        }
    }


    function updateSummaryCounter() {
        if (summaryInput) {
            limitCharacterCount(summaryInput, 500); // NOVO LIMITE DE 500
            const text = summaryInput.value;
            const count = text.length;
            if (summaryCounter) {
                summaryCounter.textContent = `${count} caracteres (Máx: 500)`; // ATUALIZAÇÃO DO TEXTO
            }
        }
    }
    
    /**
     * Mantida para fins de compatibilidade, mas não mais usada para o texto do link.
     */
    function extractLinkedInName(url) {
        if (!url || typeof url !== 'string') return '';
        
        // Remove espaços, garante minúsculas e remove http(s)
        let cleanedUrl = url.trim();
        if (cleanedUrl.startsWith('http')) {
            try {
                const parsedUrl = new URL(cleanedUrl);
                const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
                const profileIndex = pathSegments.indexOf('in');
                
                if (profileIndex !== -1 && profileIndex + 1 < pathSegments.length) {
                    return pathSegments[profileIndex + 1];
                }
            } catch (e) {
                // Se a URL for inválida, apenas retorne o texto digitado
                return cleanedUrl;
            }
        }
        
        // Se for apenas o nome ou um link incompleto, retorna o texto original
        return cleanedUrl;
    }


    function getFormData() {
        const experience = [];
        experienceContainer?.querySelectorAll('.experience-entry').forEach(entry => {
            // Garante que só responsabilidades preenchidas sejam incluídas
            const responsibilities = Array.from(entry.querySelectorAll('textarea[name="responsibility"]')).map(t => t.value).filter(v => v.trim() !== '');
            experience.push({
                jobTitle: entry.querySelector('input[name="jobTitle"]')?.value,
                company: entry.querySelector('input[name="company"]')?.value,
                startDate: entry.querySelector('input[name="startDate"]')?.value,
                endDate: entry.querySelector('input[name="endDate"]')?.value,
                responsibilities: responsibilities
            });
        });

        const education = [];
        educationContainer?.querySelectorAll('.education-entry').forEach(entry => {
            education.push({
                course: entry.querySelector('input[name="course"]')?.value,
                institution: entry.querySelector('input[name="institution"]')?.value,
                conclusionYear: entry.querySelector('input[name="conclusionYear"]')?.value
            });
        });

        const certifications = [];
        certificationContainer?.querySelectorAll('.certification-entry').forEach(entry => {
            certifications.push({
                name: entry.querySelector('input[name="certName"]')?.value,
                issuer: entry.querySelector('input[name="certIssuer"]')?.value,
                year: entry.querySelector('input[name="certYear"]')?.value
            });
        });

        return {
            nomeCompleto: nameInput?.value,
            email: emailInput?.value,
            telefone: phone1Input?.value,
            endereco: addressInput?.value,
            linkedin: linkedinInput?.value,
            summary: summaryInput?.value,
            // Filtra strings vazias resultantes do split
            skills: skillsInput?.value.split(',').map(s => s.trim()).filter(s => s !== '') || [],
            languages: languagesInput?.value.split(',').map(l => l.trim()).filter(l => l !== '') || [],
            activities: activitiesInput?.value,
            photoURL: hidePhotoCheckbox?.checked ? null : photoDataURL,
            experience: experience,
            education: education,
            certifications: certifications,
            template: templateId
        };
    }

    function updateInput() {
        updateSummaryCounter();
        // NOVO: Limite de atividades aplicado aqui
        if (activitiesInput) limitCharacterCount(activitiesInput, 200);
        
        // Atualiza responsabilidades, se existirem (limitCharacterCount é aplicado no addExperienceEntry)
        experienceContainer?.querySelectorAll('textarea[name="responsibility"]').forEach(textarea => {
             limitCharacterCount(textarea, 200);
        });

        generateResume(); // Chamada de atualização
    }

    /* -------------------- Funções Dinâmicas (Adicionar/Remover) -------------------- */
    
    function addExperienceEntry(data = {}) {
        const entry = document.createElement('div');
        entry.className = 'experience-entry';
        entry.innerHTML = `
          <button type="button" class="remove-button">Remover</button>
          <label>Cargo/Posição:</label>
          <input type="text" name="jobTitle" value="${data.jobTitle || ''}">
          <label>Empresa:</label>
          <input type="text" name="company" value="${data.company || ''}">
          <label>Início:</label>
          <input type="text" name="startDate" placeholder="Ex: Jan/2020" value="${data.startDate || ''}">
          <label>Fim (ou "Atual"):</label>
          <input type="text" name="endDate" placeholder="Ex: Mar/2022 ou Atual" value="${data.endDate || ''}">
          <label>Responsabilidades (uma por linha):</label>
          <div class="responsibilities-container">
            ${(data.responsibilities || ['']).map(resp => `<textarea name="responsibility" placeholder="Descrição da responsabilidade">${resp}</textarea>`).join('')}
          </div>
          <button type="button" class="add-responsibility-btn">Adicionar Responsabilidade</button>
        `;
        experienceContainer?.appendChild(entry);
        entry.querySelector('.remove-button')?.addEventListener('click', () => { entry.remove(); updateInput(); });
        
        // Aplica o evento de INPUT e LIMITE de 200 caracteres para responsabilidades existentes
        entry.querySelectorAll('input, textarea').forEach(input => {
             input.addEventListener('input', () => {
                 if (input.name === 'responsibility') {
                     limitCharacterCount(input, 200); // NOVO LIMITE DE 200
                 }
                 updateInput();
             });
        });

        const addResponsibilityBtn = entry.querySelector('.add-responsibility-btn');
        const responsibilitiesContainer = entry.querySelector('.responsibilities-container');
        addResponsibilityBtn?.addEventListener('click', () => {
            const newTextarea = document.createElement('textarea');
            newTextarea.name = 'responsibility';
            newTextarea.placeholder = 'Descrição da responsabilidade';
            newTextarea.addEventListener('input', () => {
                limitCharacterCount(newTextarea, 200); // NOVO LIMITE DE 200
                updateInput();
            });
            responsibilitiesContainer?.appendChild(newTextarea);
        });
    }

    function addEducationEntry(data = {}) {
        const entry = document.createElement('div');
        entry.className = 'education-entry';
        entry.innerHTML = `
          <button type="button" class="remove-button">Remover</button>
          <label>Curso/Grau:</label>
          <input type="text" name="course" value="${data.course || ''}">
          <label>Instituição:</label>
          <input type="text" name="institution" value="${data.institution || ''}">
          <label>Ano de Conclusão:</label>
          <input type="text" name="conclusionYear" placeholder="Ex: 2020" value="${data.conclusionYear || ''}">
        `;
        educationContainer?.appendChild(entry);
        entry.querySelector('.remove-button')?.addEventListener('click', () => { entry.remove(); updateInput(); });
        entry.querySelectorAll('input, textarea').forEach(input => input.addEventListener('input', updateInput));
    }

    function addCertificationEntry(data = {}) {
        const entry = document.createElement('div');
        entry.className = 'certification-entry';
        entry.innerHTML = `
          <button type="button" class="remove-button">Remover</button>
          <label>Nome da Certificação:</label>
          <input type="text" name="certName" value="${data.name || ''}">
          <label>Emissor:</label>
          <input type="text" name="certIssuer" value="${data.issuer || ''}">
          <label>Ano:</label>
          <input type="text" name="certYear" placeholder="Ex: 2023" value="${data.year || ''}">
        `;
        certificationContainer?.appendChild(entry);
        entry.querySelector('.remove-button')?.addEventListener('click', () => { entry.remove(); updateInput(); });
        entry.querySelectorAll('input, textarea').forEach(input => input.addEventListener('input', updateInput));
    }


    /* -------------------- Renderização de Seções -------------------- */
    
    function renderSkills(data) {
        if (!data.skills || data.skills.length === 0) return '';
        const skillsList = data.skills.map(skill => skill ? `<li>${skill}</li>` : '').join('');
        return `
            <div class="secao-box skills-section">
                <h3>Habilidades</h3>
                <ul>${skillsList}</ul>
            </div>
        `;
    }

    function renderLanguages(data) {
        if (!data.languages || data.languages.length === 0) return '';
        const languagesList = data.languages.map(lang => lang ? `<li>${lang}</li>` : '').join('');
        return `
            <div class="secao-box languages-section">
                <h3>Idiomas</h3>
                <ul>${languagesList}</ul>
            </div>
        `;
    }

    function renderExperience(data) {
        // Filtra entradas vazias para não renderizar o cabeçalho se todas as experiências estiverem vazias
        const validExperience = data.experience.filter(exp => 
            exp.jobTitle || exp.company || exp.startDate || exp.endDate || (exp.responsibilities && exp.responsibilities.length > 0)
        );
        
        if (!validExperience || validExperience.length === 0) return '';
        
        const experienceList = validExperience.map(exp => {
            const responsibilities = (exp.responsibilities || []).map(resp => resp ? `<li>${resp}</li>` : '').join('');
            return `
                <div class="experiencia-item">
                    <h4>${exp.jobTitle || ''}</h4>
                    <p><strong>${exp.company || ''}</strong>, ${exp.startDate || ''} - ${exp.endDate || 'Atual'}</p>
                    ${responsibilities ? `<ul>${responsibilities}</ul>` : ''}
                </div>
            `;
        }).join('');
        return `
            <div class="secao-box experience-section">
                <h3>Experiência Profissional</h3>
                ${experienceList}
            </div>
        `;
    }

    function renderEducation(data) {
        // Filtra entradas vazias
        const validEducation = data.education.filter(edu => 
            edu.course || edu.institution || edu.conclusionYear
        );

        if (!validEducation || validEducation.length === 0) return '';

        const educationList = validEducation.map(edu => {
            return `
                <div class="education-entry">
                    <h4>${edu.course || ''}</h4>
                    <p><strong>${edu.institution || ''}</strong>, ${edu.conclusionYear || ''}</p>
                </div>
            `;
        }).join('');
        return `
            <div class="secao-box education-section">
                <h3>Formação Acadêmica</h3>
                ${educationList}
            </div>
        `;
    }

    function renderCertifications(data) {
        // Filtra entradas vazias
        const validCertifications = data.certifications.filter(cert => 
            cert.name || cert.issuer || cert.year
        );

        if (!validCertifications || validCertifications.length === 0) return '';
        
        const certificationsList = validCertifications.map(cert => {
            return `<div class="certification-entry">
                        <h4>${cert.name || ''}</h4>
                        <p><strong>${cert.issuer || ''}</strong>, ${cert.year || ''}</p>
                    </div>`;
        }).join('');
        return `<div class="secao-box certification-section">
                        <h3>Certificações</h3>
                        ${certificationsList}
                    </div>`;
    }

    function renderSummary(data) {
        if (!data.summary || data.summary.trim() === '') return '';
        // No Modelo 2, o resumo é a primeira coisa na coluna direita
        return `
            <div class="secao-box summary-section">
                <h3>Resumo Profissional</h3>
                <p>${data.summary}</p>
            </div>
        `;
    }
    
    /* -------------------- Modelos de Currículo -------------------- */

    function renderModelo1(data) {
        // NOVO: Verifica se há qualquer informação de contato
        const hasContact = data.telefone || data.email || data.linkedin || data.endereco;

        const contatoInfoHTML = hasContact ? `
            <div class="contact-info">
                ${data.telefone ? `<p><i class="fa-solid fa-phone"></i> ${data.telefone}</p>` : ''}
                ${data.email ? `<p><i class="fa-solid fa-envelope"></i> ${data.email}</p>` : ''}
                ${data.linkedin ? `<p><i class="fa-brands fa-linkedin"></i> <a href="${data.linkedin}" target="_blank">linkedin</a></p>` : ''}
                ${data.endereco ? `<p><i class="fa-solid fa-location-dot"></i> ${data.endereco}</p>` : ''}
                </div>
        ` : '';
        
        // CORREÇÃO: A seção Contato só aparece se houver dados
        const contactSectionHTML = hasContact ? `
            <div class="secao-box">
                <h3>Contato</h3>
                ${contatoInfoHTML}
            </div>
        ` : '';

        const leftColumnHTML = `
            <div class="resume-left">
                ${data.photoURL ? `<img src="${data.photoURL}" class="resume-photo" alt="Foto de perfil">` : ''}
                ${contactSectionHTML}
                ${renderSkills(data)}
                ${renderLanguages(data)}
                ${data.activities ? `<div class="secao-box activities-section"><h3>Atividades</h3><p>${data.activities}</p></div>` : ''}
            </div>
        `;

        const rightColumnHTML = `
            <div class="resume-right">
                <h1>${data.nomeCompleto || 'SEU NOME COMPLETO'}</h1>
                ${renderSummary(data)}
                ${renderExperience(data)}
                ${renderEducation(data)}
                ${renderCertifications(data)}
            </div>
        `;

        return `<div class="resume-content-wrapper">${leftColumnHTML}${rightColumnHTML}</div>`;
    }

    function renderModelo2(data) {
        // NOVO: Verifica se há qualquer informação de contato
        const hasContact = data.telefone || data.email || data.linkedin || data.endereco;

        // Contato unificado na coluna esquerda
        const contatoInfoHTML = hasContact ? `
            <div class="contact-info">
                ${data.telefone ? `<p><i class="fa-solid fa-phone"></i> ${data.telefone}</p>` : ''}
                ${data.email ? `<p><i class="fa-solid fa-envelope"></i> ${data.email}</p>` : ''}
                ${data.linkedin ? `<p><i class="fa-brands fa-linkedin"></i> <a href="${data.linkedin}" target="_blank">linkedin</a></p>` : ''}
                ${data.endereco ? `<p><i class="fa-solid fa-location-dot"></i> ${data.endereco}</p>` : ''}
            </div>
        ` : '';

        // CORREÇÃO: A seção Contato só aparece se houver dados
        const contactSectionHTML = hasContact ? `
            <div class="secao-box">
                <h3>Contato</h3>
                ${contatoInfoHTML}
            </div>
        ` : '';

        const cabecalhoHTML = `
            <div class="cabecalho">
                <div class="perfil">
                    <div class="nome-e-titulo">
                        <h1>${data.nomeCompleto || 'SEU NOME COMPLETO'}</h1>
                        </div>
                </div>
            </div>
        `;

        const colunaEsquerdaHTML = `
            <div class="coluna-esquerda">
                ${data.photoURL ? `<div class="secao-box photo-box-modelo2"><img src="${data.photoURL}" class="resume-photo-modelo2" alt="Foto de perfil"></div>` : ''}
                ${contactSectionHTML}
                ${renderSkills(data)}
                ${renderLanguages(data)}
                ${data.activities ? `<div class="secao-box activities-section"><h3>Atividades</h3><p>${data.activities}</p></div>` : ''}
            </div>
        `;

        const colunaDireitaHTML = `
            <div class="coluna-direita">
                ${renderSummary(data)}
                ${renderExperience(data)}
                ${renderEducation(data)}
                ${renderCertifications(data)}
            </div>
        `;

        return `
            <div class="curriculo-container">
                ${cabecalhoHTML}
                <div class="conteudo-principal">
                    ${colunaEsquerdaHTML}
                    ${colunaDireitaHTML}
                </div>
            </div>
        `;
    }
    
    // -------------------- Lógica de Geração Principal --------------------

    async function generateResume() {
        const data = getFormData();
        let content = '';

        if (data.template === 'template-modelo1') {
            content = renderModelo1(data);
        } else {
            content = renderModelo2(data);
        }

        if (resumePreview) {
            resumePreview.innerHTML = content;
            resumePreview.className = '';
            resumePreview.classList.add(data.template);
        }
    }

    /* -------------------- Funções de Foto/Croppie -------------------- */
    
    function initCroppie() {
        if (croppieInstance) {
            croppieInstance.destroy();
        }

        // TAMANHO PADRONIZADO E AUMENTADO PARA 120px
        croppieInstance = new Croppie(croppieContainer, {
            viewport: { width: 120, height: 120, type: 'circle' }, 
            boundary: { width: 160, height: 160 }, 
            enableExif: true,
            showZoomer: true
        });
    }

    async function handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (file && croppieContainer) {
            croppieContainer.style.display = 'block';
            const reader = new FileReader();
            reader.onload = (e) => {
                initCroppie();
                croppieInstance.bind({ url: e.target.result });
            };
            reader.readAsDataURL(file);
        }
    }

    async function cropAndSetPhoto() {
        if (croppieInstance) {
            try {
                photoDataURL = await croppieInstance.result({
                    type: 'base64',
                    size: 'viewport',
                    circle: true
                });
                await generateResume(); // Gera o preview após cortar a foto
            } catch (e) {
                console.error("Erro ao cortar a imagem:", e);
            }
        }
    }


    /* -------------------- Funções de Download -------------------- */
    /**
     * FUNÇÃO REVISADA E OTIMIZADA PARA ELIMINAR A PÁGINA EM BRANCO.
     * Incorpora as melhorias propostas para controle de padding/margin e epsilon.
     */
    async function downloadPdf() {
        if (!resumePreview) return console.error("Elemento de pré-visualização não encontrado.");

        // 1. Garante que a foto esteja cortada e o preview atualizado
        await cropAndSetPhoto();
        await generateResume(); // Garante o conteúdo mais recente

        const element = resumePreview;
        
        // Guarda o estado de visibilidade
        const previewWasHidden = element.style.display === 'none';
        if (previewWasHidden) element.style.display = 'block';

        // 2. Ajustes temporários no elemento para exportação (210mm = Largura A4)
        const originalStyle = element.style.cssText;
        element.style.width = '210mm';
        element.style.minHeight = 'auto';
        element.style.height = 'auto';
        
        // 3. Clona e garante estilos que evitam overflow por padding/margem
        const clone = element.cloneNode(true);
        clone.style.position = 'absolute';
        clone.style.top = '-9999px';
        clone.style.left = '-9999px';
        clone.style.width = '210mm';
        clone.style.height = 'auto';
        clone.style.padding = '0'; // Otimização
        clone.style.margin = '0';   // Otimização
        clone.style.boxSizing = 'border-box';
        clone.style.overflow = 'visible';

        // Zera margens internas (h1, p, etc.) para prevenir empurrões de página
        clone.querySelectorAll('*').forEach(el => {
            el.style.boxSizing = 'border-box';
            el.style.marginTop = el.style.marginTop || '0';
            el.style.marginBottom = el.style.marginBottom || '0';
        });

        document.body.appendChild(clone);

        // 4. Renderiza o canvas
        const canvas = await html2canvas(clone, {
            scale: 3,
            useCORS: true,
            allowTaint: true,
            scrollY: -window.scrollY // ajuda em páginas com scroll
        });

        // 5. Remove o clone e restaura o estilo original
        document.body.removeChild(clone);
        element.style.cssText = originalStyle;
        if (previewWasHidden) element.style.display = 'none';

        // 6. Gera o PDF - Lógica Otimizada (evita página em branco)
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new window.jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgWidth = 210; 
        const pageHeight = 297; 
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        // CORREÇÃO ROBUSTA PARA PÁGINA EM BRANCO: Usa um epsilon maior
        const epsilon = 0.01; 
        let totalPages = Math.ceil((imgHeight / pageHeight) - epsilon);
        
        if (totalPages === 0 && imgHeight > 0) {
            totalPages = 1;
        }

        for (let i = 0; i < totalPages; i++) {
            if (i > 0) {
                pdf.addPage();
            }
            // Calcula o offset negativo para rolar a imagem para cima
            const yPosition = -(pageHeight * i);
            pdf.addImage(imgData, 'JPEG', 0, yPosition, imgWidth, imgHeight);
        }

        const data = getFormData();
        const filename = `${(data.nomeCompleto || 'curriculo_anonimo').replace(/\s/g, '_')}_${data.template}.pdf`;
        pdf.save(filename);
    }


    /* -------------------- Funções de Cor/Estilo -------------------- */
    
    function applyNewColor(color) {
        selectedPrimaryColor = color;
        // Aplica uma transparência de 13.3% ao secundário (hex '22')
        selectedSecondaryColor = color + '22'; 

        document.documentElement.style.setProperty('--primary-color', selectedPrimaryColor);
        document.documentElement.style.setProperty('--secondary-color', selectedSecondaryColor);

        document.querySelectorAll('.color-option').forEach(opt => {
            opt.classList.remove('selected');
            if (opt.getAttribute('data-color') === color) {
                opt.classList.add('selected');
            }
        });

        updateThumbnailSelection();
    }

    function updateThumbnailSelection() {
        const selected = document.querySelector('input[name="template"]:checked')?.value;
        document.querySelectorAll('.template-thumbnail').forEach(th => {
            const id = th.getAttribute('data-template');
            th.style.borderColor = id === selected ? selectedPrimaryColor : '#ddd';
            th.style.borderWidth = id === selected ? '3px' : '1px';
        });
    }

    function initializeColorPicker() {
        const colors = ['#2a3eb1', '#2196f3', '#009688', '#e91e63', '#ff9800', '#607d8b'];
        let html = '<p>Selecione um tema:</p><div style="display:flex;gap:8px;margin-top:8px;">';
        colors.forEach(c => html += `<div class="color-option" data-color="${c}" style="background:${c}"></div>`);
        html += '</div>';
        if (colorPickerSection) colorPickerSection.innerHTML = html;
        document.querySelectorAll('.color-option').forEach(opt => opt.addEventListener('click', function () { applyNewColor(this.getAttribute('data-color')) }));
        applyNewColor(selectedPrimaryColor);
    }


    /* -------------------- Eventos iniciais (MAIN) -------------------- */

    // Eventos de mudança nos inputs (para campos não dinâmicos)
    document.querySelectorAll('input, textarea').forEach(input => {
        if (input.type !== 'radio' && input.type !== 'checkbox' && !input.closest('.experience-entry') && !input.closest('.education-entry') && !input.closest('.certification-entry')) {
             input.addEventListener('input', updateInput);
        }
    });

    // Eventos de campos específicos com contadores/limites
    summaryInput?.addEventListener('input', updateSummaryCounter);
    // Limite de atividades
    activitiesInput?.addEventListener('input', () => { limitCharacterCount(activitiesInput, 200); updateInput(); }); 
    updateSummaryCounter();

    // Eventos de botões dinâmicos
    addExperienceBtn?.addEventListener('click', () => { addExperienceEntry(); updateInput(); }); 
    addEducationBtn?.addEventListener('click', () => { addEducationEntry(); updateInput(); }); 
    addCertificationBtn?.addEventListener('click', () => { addCertificationEntry(); updateInput(); }); 

    // Eventos de mudança de Template
    templateRadioButtons.forEach(r => {
        r.addEventListener('change', async () => {
            templateId = r.value;
            updateThumbnailSelection();
            await generateResume();
        });
    });

    // Eventos de foto
    photoInput?.addEventListener('change', handlePhotoUpload);
    hidePhotoCheckbox?.addEventListener('change', generateResume);

    // Botão de Pré-visualização (generateResumeButton)
    if(previewButton) {
        previewButton.addEventListener('click', async () => {
            // 1. Aplica o corte da foto (se houver)
            await cropAndSetPhoto(); 
            // 2. Exibe a pré-visualização
            if (resumePreview) {
                resumePreview.style.display = 'block'; 
            }
        });
    } else {
        console.error("ERRO: Botão 'generateResumeButton' não encontrado. Verifique o ID no HTML.");
    }

    // Botão de Download PDF
    if(downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', downloadPdf);
    } else {
        console.error("ERRO: Botão 'downloadPdf' não encontrado. Verifique o ID no HTML.");
    }
    
    // Inicialização
    initializeColorPicker();

    // Adiciona entradas vazias iniciais (se necessário, para ter campos a serem preenchidos)
    if (experienceContainer?.children.length === 0) addExperienceEntry({});
    if (educationContainer?.children.length === 0) addEducationEntry({});
    if (certificationContainer?.children.length === 0) addCertificationEntry({});

    // Define o template inicial e renderiza
    const initialTemplate = document.querySelector('input[name="template"]:checked');
    if (initialTemplate) {
        templateId = initialTemplate.value;
    }
    generateResume(); // Renderização inicial
});