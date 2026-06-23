// -------------------- Variáveis Globais do Assistente (IA) -------------------- 
let aiAvatar, aiBubble, aiAssistantContainer;

const AVATAR_MAP = {
    'neutro': './assets/avatar/neutro.png',   
    'alerta': './assets/avatar/alerta.png',   
    'feliz': './assets/avatar/feliz.png',    
    'duvida': './assets/avatar/duvida.png'   
};

const INTENT_MAP = {
    'objetivo_dica': {
        status: 'duvida',
        message: '🎯 **Resumo:** Seja conciso (Máx. 500 caracteres)! Foco em 1-2 frases que alinham suas aspirações com a vaga. Evite frases genéricas como "Em busca de novos desafios".'
    },
    'experiencia_dica': {
        status: 'duvida',
        message: '⭐ **Experiência:** Use o formato "Resultado atingido (quantificar) através de Ação (verbo de ação)". Use a descrição de Responsabilidade para isso!'
    },
    'atividade_dica': {
        status: 'duvida',
        message: '🌳 **Atividades:** Use este espaço para voluntariado, hobbies relevantes ou projetos pessoais. Máximo de 200 caracteres, seja seletivo.'
    },
    'nome_invalido': {
        status: 'alerta',
        message: '❌ **Nome Incompleto!** Por favor, insira seu nome e sobrenome (mínimo 5 caracteres é o recomendado).'
    },
    'email_invalido': {
        status: 'alerta',
        message: '⚠️ **Email Inválido!** Verifique se o formato está correto (ex: nome@dominio.com).'
    },
    'campo_corrigido': {
        status: 'feliz',
        message: '✅ Informação validada! Está ficando ótimo!'
    }
};

function setupAssistant() {
    aiAvatar = document.getElementById('avatar-img');
    aiBubble = document.getElementById('assistant-message'); 
    aiAssistantContainer = document.getElementById('ai-assistant');
}

function updateAssistant(status, message, permanent = false) {
    if (!aiAssistantContainer || !aiAvatar || !aiBubble) {
        setupAssistant();
        if (!aiAssistantContainer) return;
    } 

    if (AVATAR_MAP[status]) {
        aiAvatar.src = AVATAR_MAP[status];
        aiAssistantContainer.dataset.status = status;
    }
    
    aiBubble.innerHTML = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function monitorInput(elementId, type, intent = null) {
    const input = document.getElementById(elementId);
    if (!input) return;

    if (type === 'focus' && intent) {
        input.addEventListener('focus', () => {
            const data = INTENT_MAP[intent];
            updateAssistant(data.status, data.message); 
        });
    }

    if (type === 'blur') {
        input.addEventListener('blur', function() {
            const value = this.value.trim();
            let hasError = false;

            if (elementId === 'name' && (value.length < 5 || value.split(' ').length < 2)) {
                updateAssistant(INTENT_MAP['nome_invalido'].status, INTENT_MAP['nome_invalido'].message, true); 
                hasError = true;
            } 
            else if (elementId === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
                if (value.length > 0) { 
                    updateAssistant(INTENT_MAP['email_invalido'].status, INTENT_MAP['email_invalido'].message, true); 
                    hasError = true;
                }
            } 
            else if (elementId === 'summary' && value.length > 0 && value.length < 50) {
                 updateAssistant('alerta', '💡 **Resumo Curto!** Um resumo com menos de 50 caracteres geralmente não é eficaz. Tente expandir um pouco mais.', true);
                 hasError = true;
            }
            else if (elementId === 'activities' && value.length >= 200) {
                 updateAssistant('alerta', '⚠️ **Limite de Atividades Atingido!** O máximo recomendado é 200 caracteres. Seja conciso.', true);
                 hasError = true;
            }

            if (!hasError && aiAssistantContainer.dataset.status === 'alerta') {
                updateAssistant(INTENT_MAP['campo_corrigido'].status, INTENT_MAP['campo_corrigido'].message);
            } else if (!hasError && aiAssistantContainer.dataset.status !== 'duvida') {
                 updateAssistant('neutro', 'Tudo certo. Estou aqui se precisar de dicas!');
            }
        });
    }
}

function monitorAllInputs() {
    monitorInput('name', 'blur');
    monitorInput('email', 'blur');
    monitorInput('summary', 'blur');
    monitorInput('activities', 'blur');

    monitorInput('summary', 'focus', 'objetivo_dica');
    monitorInput('activities', 'focus', 'atividade_dica');
    monitorInput('skills', 'focus', 'experiencia_dica');
    monitorInput('languages', 'focus', 'experiencia_dica');
}


document.addEventListener('DOMContentLoaded', async () => {
    setupAssistant(); 
    updateAssistant('neutro', 'Olá! Sou seu assistente de currículo. Comece preenchendo os campos.');
    
    let selectedPrimaryColor = '#2a3eb1';
    let selectedSecondaryColor = '#e8f0fe';

    const resumePreview = document.getElementById('resumePreview');
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
    
    function limitCharacterCount(inputElement, maxChars) {
        if (inputElement && inputElement.value.length > maxChars) {
            inputElement.value = inputElement.value.substring(0, maxChars);
        }
    }

    function updateSummaryCounter() {
        if (summaryInput) {
            limitCharacterCount(summaryInput, 500);
            const text = summaryInput.value;
            const count = text.length;
            if (summaryCounter) {
                summaryCounter.textContent = `${count} caracteres (Máx: 500)`;
            }
        }
    }
    
    function extractLinkedInName(url) {
        if (!url || typeof url !== 'string') return '';
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
                return cleanedUrl;
            }
        }
        return cleanedUrl;
    }

    function getFormData() {
        const experience = [];
        experienceContainer?.querySelectorAll('.experience-entry').forEach(entry => {
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
        if (activitiesInput) limitCharacterCount(activitiesInput, 200);
        experienceContainer?.querySelectorAll('textarea[name="responsibility"]').forEach(textarea => {
             limitCharacterCount(textarea, 200);
        });
        generateResume();
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
        
        entry.querySelector('.remove-button')?.addEventListener('click', () => {
            entry.remove();
            updateInput();
        });
        
        entry.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', updateInput);
            if (input.name === 'responsibility') {
                limitCharacterCount(input, 200);
            }
            if (input.name === 'responsibility' || input.name === 'jobTitle' || input.name === 'company') {
                input.addEventListener('focus', () => {
                    const data = INTENT_MAP['experiencia_dica'];
                    updateAssistant(data.status, data.message);
                });
            }
        });

        const addResponsibilityBtn = entry.querySelector('.add-responsibility-btn');
        const responsibilitiesContainer = entry.querySelector('.responsibilities-container');

        addResponsibilityBtn?.addEventListener('click', () => {
            const newTextarea = document.createElement('textarea');
            newTextarea.name = 'responsibility';
            newTextarea.placeholder = 'Descrição da responsabilidade';
            newTextarea.addEventListener('input', () => {
                limitCharacterCount(newTextarea, 200);
                updateInput();
            });
            newTextarea.addEventListener('focus', () => {
                const data = INTENT_MAP['experiencia_dica'];
                updateAssistant(data.status, data.message);
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

        entry.querySelector('.remove-button')?.addEventListener('click', () => {
            entry.remove();
            updateInput();
        });

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

        entry.querySelector('.remove-button')?.addEventListener('click', () => {
            entry.remove();
            updateInput();
        });

        entry.querySelectorAll('input, textarea').forEach(input => input.addEventListener('input', updateInput));
    }


    /* -------------------- Funções de Renderização HTML -------------------- */
    
    function renderSkills(data) {
        if (!data.skills || data.skills.length === 0) return '';
        const skillsList = data.skills.map(skill => `<li>${skill}</li>`).join('');
        return `
            <div class="secao-box skills-section">
                <h3>Habilidades</h3>
                <ul>${skillsList}</ul>
            </div>
        `;
    }

    function renderLanguages(data) {
        if (!data.languages || data.languages.length === 0) return '';
        const languagesList = data.languages.map(lang => `<li>${lang}</li>`).join('');
        return `
            <div class="secao-box languages-section">
                <h3>Idiomas</h3>
                <ul>${languagesList}</ul>
            </div>
        `;
    }

    function renderExperience(data) {
        const validExperience = data.experience.filter(exp => exp.jobTitle || exp.company || exp.responsibilities.length > 0);
        if (!validExperience || validExperience.length === 0) return '';

        const experienceList = validExperience.map(exp => {
            const responsibilities = exp.responsibilities.length > 0 
                ? exp.responsibilities.map(resp => `<li>${resp}</li>`).join('')
                : '';

            return `
                <div class="experience-entry">
                    <h4>${exp.jobTitle || 'Cargo Não Especificado'}</h4>
                    <p><strong>${exp.company || 'Empresa Não Especificada'}</strong> | ${exp.startDate || ''} - ${exp.endDate || 'Atual'}</p>
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
        const validEducation = data.education.filter(edu => edu.course || edu.institution || edu.conclusionYear);
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
        const validCertifications = data.certifications.filter(cert => cert.name || cert.issuer || cert.year);
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
        return `
            <div class="secao-box summary-section">
                <h3>Resumo Profissional</h3>
                <p>${data.summary}</p> 
            </div>
        `;
    }
    
    function renderActivities(data) {
        if (!data.activities || data.activities.trim() === '') return '';
        return `
            <div class="secao-box activities-section">
                <h3>Atividades e Interesses</h3>
                <p>${data.activities}</p> 
            </div>
        `;
    }


    /* -------------------- Renderização por Modelo -------------------- */

    function renderModelo1(data) {
        const hasContact = data.telefone || data.email || data.linkedin || data.endereco;
        
        const contatoInfoHTML = hasContact ? `
            <div class="contact-info">
                ${data.telefone ? `<p><i class="fa-solid fa-phone"></i> ${data.telefone}</p>` : ''}
                ${data.email ? `<p><i class="fa-solid fa-envelope"></i> ${data.email}</p>` : ''}
                ${data.linkedin ? `<p><i class="fa-brands fa-linkedin"></i> <a href="${data.linkedin}" target="_blank">linkedin</a></p>` : ''}
                ${data.endereco ? `<p><i class="fa-solid fa-location-dot"></i> ${data.endereco}</p>` : ''}
            </div>
        ` : '';
        
        const photoHTML = data.photoURL ? `<img src="${data.photoURL}" class="resume-photo" alt="Foto de perfil">` : '';

        const leftColumnHTML = `
            <div class="resume-left">
                ${photoHTML}
                ${hasContact ? `<div class="secao-box"><h3>Contato</h3>${contatoInfoHTML}</div>` : ''}
                ${renderSkills(data)}
                ${renderLanguages(data)}
                ${renderActivities(data)}
                ${renderCertifications(data)}
            </div>
        `;
        
        const rightColumnHTML = `
            <div class="resume-right">
                <h1>${data.nomeCompleto || 'Seu Nome Completo'}</h1>
                ${renderSummary(data)}
                ${renderExperience(data)}
                ${renderEducation(data)}
            </div>
        `;

        return `
            <div class="resume-content-wrapper">
                ${leftColumnHTML}
                ${rightColumnHTML}
            </div>
        `;
    }

    function renderModelo2(data) {
        const hasContact = data.telefone || data.email || data.linkedin || data.endereco;
        
        const contatoInfoHTML = hasContact ? `
            <div class="contact-info">
                ${data.telefone ? `<p><i class="fa-solid fa-phone"></i> ${data.telefone}</p>` : ''}
                ${data.email ? `<p><i class="fa-solid fa-envelope"></i> ${data.email}</p>` : ''}
                ${data.linkedin ? `<p><i class="fa-brands fa-linkedin"></i> <a href="${data.linkedin}" target="_blank">linkedin</a></p>` : ''}
            </div>
        ` : '';

        const contactSectionHTML = hasContact ? `
            <div class="secao-box">
                <h3>Contato</h3>
                ${contatoInfoHTML}
            </div>
        ` : '';

        const cabecalhoHTML = `
            <div class="cabecalho">
                <div class="perfil">
                    ${data.photoURL ? `<div class="photo-box-modelo2"><img src="${data.photoURL}" class="resume-photo-modelo2" alt="Foto de perfil"></div>` : ''}
                    <div class="nome-e-titulo">
                        <h1>${data.nomeCompleto || 'Seu Nome Completo'}</h1>
                    </div>
                </div>
            </div>
        `;
        
        const colunaEsquerdaHTML = `
            <div class="coluna-esquerda">
                ${contactSectionHTML}
                ${data.endereco ? `<div class="secao-box secao-endereco"><h3>Endereço</h3><p>${data.endereco}</p></div>` : ''}
                ${renderSkills(data)}
                ${renderLanguages(data)}
                ${renderActivities(data)}
                ${renderCertifications(data)}
            </div>
        `;

        const colunaDireitaHTML = `
            <div class="coluna-direita">
                ${renderSummary(data)}
                ${renderExperience(data)}
                ${renderEducation(data)}
            </div>
        `;

        return `
            ${cabecalhoHTML}
            <div class="conteudo-principal">
                ${colunaEsquerdaHTML}
                ${colunaDireitaHTML}
            </div>
        `;
    }

    function generateResume() {
        const data = getFormData();
        
        document.documentElement.style.setProperty('--primary-color', selectedPrimaryColor);
        document.documentElement.style.setProperty('--secondary-color', selectedSecondaryColor);

        let html = '';
        if (data.template === 'template-modelo1') {
            html = renderModelo1(data);
        } else if (data.template === 'template-modelo2') {
            html = renderModelo2(data);
        }
        
        resumePreview.className = data.template;
        resumePreview.innerHTML = html;
    }


    /* -------------------- Funções de Foto/Croppie -------------------- */

    function initializeCroppie(image) {
        if (croppieInstance) {
            croppieInstance.destroy();
        }
        croppieContainer.style.display = 'block';
        croppieInstance = new Croppie(croppieContainer, {
            viewport: { width: 100, height: 100, type: 'circle' },
            boundary: { width: 250, height: 250 },
            enableExif: true,
            enableZoom: true
        });
        croppieInstance.bind({ url: image });
    }

    function handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                initializeCroppie(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }
    
    // ✅ CORREÇÃO PRINCIPAL: cropAndSetPhoto agora SEMPRE chama generateResume ao final,
    // independente de haver uma instância do Croppie ativa ou não.
    async function cropAndSetPhoto() {
        if (croppieInstance) {
            try {
                const result = await croppieInstance.result({
                    type: 'base64',
                    size: 'viewport',
                    format: 'jpeg',
                    quality: 0.9
                });
                photoDataURL = result;
            } catch (error) {
                console.error("Erro ao cortar a imagem:", error);
            } finally {
                // Destruir e nullar SEMPRE após o corte. Sem isso, um segundo clique em
                // "Pré-visualizar" chama croppie.result() num container display:none
                // (dimensões 0×0), que retorna imagem em branco e apaga a foto.
                try { croppieInstance.destroy(); } catch (_) {}
                croppieInstance = null;
                croppieContainer.style.display = 'none';
            }
        }
        generateResume();
    }


    /* -------------------- Funções de Download (Com validação da IA) -------------------- */
    
    window.jsPDF = window.jspdf.jsPDF;

    async function downloadPdf() {
        const element = resumePreview;
        if (!element || !element.innerHTML.trim()) {
            updateAssistant('alerta', '❌ Pré-visualização vazia. Clique em "Pré-visualizar" primeiro.');
            return;
        }

        downloadPdfBtn.disabled = true;
        const originalBtnText = downloadPdfBtn.textContent;
        downloadPdfBtn.textContent = '⏳ Gerando PDF...';

        let wrapper = null;

        try {
            // Wrapper fora da viewport pelo TOPO (top:-9999px).
            // Não usa visibility:hidden  → propagaria invisibilidade aos filhos,
            //   fazendo html2canvas capturar tudo como transparente (PDF em branco).
            // Não usa left:-9999px       → alarga a página e causa scroll horizontal.
            // Não passa windowWidth/windowHeight ao html2canvas → causava reflow global
            //   que colapsava o formulário e a pré-visualização durante a captura.
            wrapper = document.createElement('div');
            wrapper.style.cssText = [
                'position:fixed',
                'top:-9999px',
                'left:0',
                'width:210mm',
                'overflow:visible',
                'pointer-events:none',
                'z-index:-9999'
            ].join(';');

            const clone = element.cloneNode(true);
            clone.style.cssText = [
                'width:210mm',
                'min-height:297mm',
                'height:auto',
                'margin:0',
                'padding:0',
                'box-sizing:border-box',
                'overflow:visible',
                'transform:none',
                'font-size:initial',
                'position:relative',
                'background:#fff'
            ].join(';');

            // Remove estilos inline que mobile.css possa ter injetado
            clone.querySelectorAll('*').forEach(el => {
                el.style.transform   = 'none';
                el.style.boxSizing   = 'border-box';
                if (el.style.fontSize)   el.style.fontSize   = '';
                if (el.style.margin)     el.style.margin     = '';
                if (el.style.padding)    el.style.padding    = '';
                if (el.style.lineHeight) el.style.lineHeight = '';
            });

            wrapper.appendChild(clone);
            document.body.appendChild(wrapper);

            // 2 frames: 1 para o DOM montar, 1 para o browser calcular o layout
            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

            // Timeout de 30s: evita que o botão fique travado se html2canvas
            // nunca resolver (ex: recurso de CDN bloqueado pela rede)
            const canvas = await Promise.race([
                html2canvas(clone, {
                    scale: 4,
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    scrollX: 0,
                    scrollY: 0
                }),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout ao capturar o currículo')), 30000)
                )
            ]);

            document.body.removeChild(wrapper);
            wrapper = null;

            const imgData      = canvas.toDataURL('image/png');
            const imgWidthMM   = 210;
            const pageHeightMM = 297;
            const imgHeightMM  = canvas.height * imgWidthMM / canvas.width;
            let   heightLeft   = imgHeightMM;

            const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
            let position = 0;

            doc.addImage(imgData, 'PNG', 0, position, imgWidthMM, imgHeightMM, '', 'FAST');
            heightLeft -= pageHeightMM;

            while (heightLeft > 5) {
                position = heightLeft - imgHeightMM;
                doc.addPage();
                doc.addImage(imgData, 'PNG', 0, position, imgWidthMM, imgHeightMM, '', 'FAST');
                heightLeft -= pageHeightMM;
            }

            const formData = getFormData();
            const fileName = (formData.nomeCompleto || 'Curriculo').replace(/[^a-z0-9]/gi, '_');
            doc.save(fileName + '_CV.pdf');

            updateAssistant('feliz', '✅ **Download Concluído!** Verifique sua pasta de downloads.', true);

        } catch (err) {
            console.error('Erro ao gerar PDF:', err);
            if (wrapper && wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
            updateAssistant('alerta', '❌ Erro ao gerar o PDF. Tente novamente.', true);

        } finally {
            // Restaura o botão SEMPRE — sucesso, erro ou timeout
            downloadPdfBtn.disabled = false;
            downloadPdfBtn.textContent = originalBtnText;
        }
    }



    /* -------------------- Paleta de Cores -------------------- */

    const COLOR_PALETTES = [
        { primary: '#2a3eb1', secondary: '#e8f0fe', label: 'Azul (Padrão)' },
        { primary: '#1a7f5a', secondary: '#e6f4ef', label: 'Verde' },
        { primary: '#b13a2a', secondary: '#fdecea', label: 'Vermelho' },
        { primary: '#7b2fa8', secondary: '#f3e8fd', label: 'Roxo' },
        { primary: '#c47d11', secondary: '#fef8e7', label: 'Dourado' },
        { primary: '#1a5276', secondary: '#d6eaf8', label: 'Azul Escuro' },
        { primary: '#222222', secondary: '#f0f0f0', label: 'Cinza' },
        { primary: '#c0392b', secondary: '#fdedec', label: 'Carmim' },
    ];

    function initializeColorPicker() {
        const colorOptions = document.getElementById('colorOptions');
        if (!colorOptions) return;

        COLOR_PALETTES.forEach((palette, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.title = palette.label;
            btn.setAttribute('aria-label', palette.label);
            btn.className = 'color-option' + (index === 0 ? ' selected' : '');
            btn.style.cssText = `
                width: 36px; height: 36px; border-radius: 50%; cursor: pointer;
                border: 3px solid transparent; padding: 0; position: relative;
                background: linear-gradient(135deg, ${palette.primary} 50%, ${palette.secondary} 50%);
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                transition: transform 0.15s, border-color 0.15s;
            `;
            if (index === 0) btn.style.borderColor = '#000';

            btn.addEventListener('click', () => {
                colorOptions.querySelectorAll('.color-option').forEach(b => {
                    b.classList.remove('selected');
                    b.style.borderColor = 'transparent';
                    b.style.transform = 'scale(1)';
                });
                btn.classList.add('selected');
                btn.style.borderColor = '#000';
                btn.style.transform = 'scale(1.15)';

                selectedPrimaryColor = palette.primary;
                selectedSecondaryColor = palette.secondary;
                updateInput();
            });

            colorOptions.appendChild(btn);
        });
    }

    /* -------------------- Listeners de Eventos -------------------- */
    
    [nameInput, emailInput, phone1Input, skillsInput, languagesInput, activitiesInput, addressInput, linkedinInput].forEach(input => {
        input?.addEventListener('input', updateInput);
    });
    
    summaryInput?.addEventListener('input', updateInput);

    addExperienceBtn?.addEventListener('click', () => { addExperienceEntry({}); updateInput(); });
    addEducationBtn?.addEventListener('click', () => { addEducationEntry({}); updateInput(); });
    addCertificationBtn?.addEventListener('click', () => { addCertificationEntry({}); updateInput(); });

    templateRadioButtons.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                templateId = e.target.value;
                updateInput();
            }
        });
    });
    
    photoInput?.addEventListener('change', handlePhotoUpload);
    hidePhotoCheckbox?.addEventListener('change', generateResume);
    
    previewButton?.addEventListener('click', async () => {
        await cropAndSetPhoto();
        updateAssistant('neutro', 'Pré-visualização atualizada! Role para baixo para ver o resultado.');
    });

    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', async () => {
            const data = getFormData();
            
            const nomeValido = data.nomeCompleto && data.nomeCompleto.trim().length >= 5 && data.nomeCompleto.split(' ').length >= 2;
            const emailValido = data.email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email.trim());

            if (!nomeValido || !emailValido) {
                 updateAssistant('alerta', 
                    '\u{1F6D1} **Aten\u00e7\u00e3o! Curr\u00edculo Incompleto!** Por favor, verifique se seu **Nome Completo** e **Email** est\u00e3o preenchidos corretamente antes de baixar.', 
                    true
                );
                 return;
            }

            await downloadPdf();
        });
    } else {
        console.error("ERRO: Botão 'downloadPdf' não encontrado. Verifique o ID no HTML.");
    }
    
    // Inicialização
    initializeColorPicker();

    if (experienceContainer?.children.length === 0) addExperienceEntry({});
    if (educationContainer?.children.length === 0) addEducationEntry({});
    if (certificationContainer?.children.length === 0) addCertificationEntry({});

    const initialTemplate = document.querySelector('input[name="template"]:checked');
    if (initialTemplate) {
        templateId = initialTemplate.value;
    } else {
        const defaultRadio = document.querySelector('input[name="template"][value="template-modelo1"]');
        if (defaultRadio) {
            defaultRadio.checked = true;
            templateId = 'template-modelo1';
        }
    }

    monitorAllInputs();
    updateInput(); 
});

/* -------------------- Modal de Pré-visualização (Mobile/Click) -------------------- */

function openResumeModal() {
    if (!resumePreview.innerHTML.trim()) {
        updateAssistant('alerta', '❌ Clique em "Pré-visualizar" antes de abrir a visualização.', true);
        return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'resume-modal-overlay';

    const content = document.createElement('div');
    content.className = `resume-modal-content ${resumePreview.className}`;

    // Clona o conteúdo do preview, removendo qualquer transform/escala aplicada pelo mobile.css
    const clone = resumePreview.cloneNode(true);
    clone.removeAttribute('id');
    clone.style.transform = 'none';
    clone.style.fontSize = '';
    clone.style.width = '210mm';
    clone.style.minHeight = '297mm';
    clone.querySelectorAll('*').forEach(el => {
        el.style.transform = 'none';
        if (el.style.fontSize) el.style.fontSize = '';
        if (el.style.margin) el.style.margin = '';
        if (el.style.padding) el.style.padding = '';
        if (el.style.lineHeight) el.style.lineHeight = '';
    });

    content.appendChild(clone);
    overlay.appendChild(content);

    const actions = document.createElement('div');
    actions.className = 'resume-modal-actions';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'resume-modal-close';
    closeBtn.textContent = '✖ Fechar';
    closeBtn.addEventListener('click', () => overlay.remove());

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'resume-modal-download';
    downloadBtn.textContent = '⬇ Baixar PDF';
    downloadBtn.addEventListener('click', () => downloadPdfBtn.click());

    actions.appendChild(closeBtn);
    actions.appendChild(downloadBtn);
    overlay.appendChild(actions);

    document.body.appendChild(overlay);

    // Escala o conteúdo (210mm) para caber na largura da tela, com margem
    requestAnimationFrame(() => {
        const naturalWidth = content.offsetWidth; // 210mm em px
        const available = window.innerWidth * 0.95;
        const scale = Math.min(1, available / naturalWidth);
        content.style.transform = `scale(${scale})`;
        content.style.transformOrigin = 'top center';
        if (scale < 1) {
            content.style.marginBottom = `-${naturalWidth * (1 - scale)}px`;
        }
    });

    // Fecha clicando fora do conteúdo
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
}

resumePreview?.addEventListener('click', () => {
    if (resumePreview.innerHTML.trim()) {
        openResumeModal();
    }
});