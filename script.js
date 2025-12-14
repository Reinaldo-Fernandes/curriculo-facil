/**
 * script.js - Versão corrigida e completa COM ASSISTENTE IA
 * * - Novas funcionalidades de IA para monitoramento e dicas:
 * - updateAssistant: Controla o estado visual e a mensagem do avatar.
 * - monitorInput: Adiciona listeners de foco e perda de foco para validação e dicas.
 * - monitorAllInputs: Inicializa os listeners nos campos estáticos.
 * * - Alterações na lógica principal:
 * - Modificação do listener de downloadPdf para incluir a validação da IA.
 * - Adição de listeners 'focus' nos campos de experiência e responsabilidade para dicas.
 * * - CORREÇÃO ATUAL: Ajuste na lógica da função downloadPdf para resolver o problema da segunda página em branco.
 */

// -------------------- Variáveis Globais do Assistente (IA) -------------------- 
let aiAvatar, aiBubble, aiAssistantContainer;

const AVATAR_MAP = {
    // Estes são os placeholders. Você deve criar as imagens em /assets/
    'neutro': './assets/avatar/neutro.png',   
    'alerta': './assets/avatar/alerta.png',   
    'feliz': './assets/avatar/feliz.png',    
    'duvida': './assets/avatar/duvida.png'   
};

// Mapeamento de intenções e respostas para dicas e validações
const INTENT_MAP = {
    // Dicas de Conteúdo
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
    // Alertas de Validação
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

/**
 * 0. Inicialização: Configura as referências do DOM para o assistente.
 */
function setupAssistant() {
    aiAvatar = document.getElementById('avatar-img');
    aiBubble = document.getElementById('assistant-message');
    aiAssistantContainer = document.getElementById('ai-assistant');
}

/**
 * 1. Função Central: Atualiza o estado visual e a mensagem do assistente.
 * @param {string} status - O novo estado (neutro, alerta, feliz, duvida).
 * @param {string} message - A mensagem a ser exibida.
 * @param {boolean} permanent - Se true, não volta ao estado 'neutro' automaticamente.
 */
function updateAssistant(status, message, permanent = false) {
    if (!aiAssistantContainer) return; // Proteção

    // Atualiza o Avatar e o Status (Gatilho da Transição CSS para fluidez)
    if (AVATAR_MAP[status]) {
        aiAvatar.src = AVATAR_MAP[status];
        aiAssistantContainer.dataset.status = status;
    }
    
    // Usa innerHTML para permitir negrito (**) na mensagem
    aiBubble.innerHTML = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Se não for permanente, agenda o retorno ao estado neutro
    if (!permanent && status !== 'neutro') {
        setTimeout(() => {
            if (aiAssistantContainer.dataset.status === status) {
                updateAssistant('neutro', 'Tudo certo. Estou aqui se precisar de dicas!');
            }
        }, 10000); // 10 segundos
    }
}

/**
 * 2. Monitoramento de Campos de Entrada
 * @param {string} elementId - ID do input a ser monitorado (ex: 'name', 'email').
 * @param {string} type - Tipo de validação/dica ('blur', 'focus').
 * @param {string} intent - Chave do INTENT_MAP para dicas (focus) ou validação (blur).
 */
function monitorInput(elementId, type, intent = null) {
    const input = document.getElementById(elementId);
    if (!input) return;

    // Evento de Foco (Para Dicas de Conteúdo)
    if (type === 'focus' && intent) {
        input.addEventListener('focus', () => {
            const data = INTENT_MAP[intent];
            updateAssistant(data.status, data.message);
        });
    }

    // Evento de Perda de Foco (Para Validação de Erros/Faltas)
    if (type === 'blur') {
        input.addEventListener('blur', function() {
            const value = this.value.trim();
            let hasError = false;

            // 1. Validação de Nome (Mínimo 5 caracteres e 2 palavras)
            if (elementId === 'name' && (value.length < 5 || value.split(' ').length < 2)) {
                updateAssistant(INTENT_MAP['nome_invalido'].status, INTENT_MAP['nome_invalido'].message, true); 
                hasError = true;
            } 
            
            // 2. Validação de Email (Regex básica)
            else if (elementId === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
                if (value.length > 0) { 
                    updateAssistant(INTENT_MAP['email_invalido'].status, INTENT_MAP['email_invalido'].message, true); 
                    hasError = true;
                }
            } 
            
            // 3. Validação de Resumo (Mínimo recomendado)
            else if (elementId === 'summary' && value.length > 0 && value.length < 50) {
                 updateAssistant('alerta', '💡 **Resumo Curto!** Um resumo com menos de 50 caracteres geralmente não é eficaz. Tente expandir um pouco mais.', true);
                 hasError = true;
            }
            
            // 4. Validação de Atividades (Limite superior)
            else if (elementId === 'activities' && value.length >= 200) {
                 updateAssistant('alerta', '⚠️ **Limite de Atividades Atingido!** O máximo recomendado é 200 caracteres. Seja conciso.', true);
                 hasError = true;
            }

            // Caso Corrija ou Preencha Corretamente e não haja novos erros
            if (!hasError && aiAssistantContainer.dataset.status === 'alerta') {
                updateAssistant(INTENT_MAP['campo_corrigido'].status, INTENT_MAP['campo_corrigido'].message);
            }
        });
    }
}


/**
 * 3. Função Agregadora: Chama todas as monitorações necessárias
 */
function monitorAllInputs() {
    // Campos com Validação (Erros e Correções)
    monitorInput('name', 'blur'); // Nome Completo
    monitorInput('email', 'blur'); // Email
    monitorInput('summary', 'blur'); // Resumo para checar tamanho mínimo
    monitorInput('activities', 'blur'); // Atividades para checar limite

    // Campos com Dicas de Conteúdo (Ao ganhar Foco)
    monitorInput('summary', 'focus', 'objetivo_dica'); // Resumo Profissional
    monitorInput('activities', 'focus', 'atividade_dica'); // Atividades
    monitorInput('skills', 'focus', 'experiencia_dica'); // Reutiliza dica para Skills, pois são itens importantes.
    monitorInput('languages', 'focus', 'experiencia_dica'); // Reutiliza dica para Languages
}


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
        
        // Listeners para remover
        entry.querySelector('.remove-button')?.addEventListener('click', () => {
            entry.remove();
            updateInput();
        });
        
        // Listeners para input
        entry.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', updateInput);
            // Aplica limite de caracteres e listener de foco para responsabilidades
            if (input.name === 'responsibility') {
                limitCharacterCount(input, 200); // NOVO LIMITE DE 200
            }
             // NOVO: Adiciona o listener de foco para dicas de experiência
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
                limitCharacterCount(newTextarea, 200); // NOVO LIMITE DE 200
                updateInput();
            });
            // NOVO: Adiciona o listener de foco para a nova responsabilidade
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
        // Filtra entradas vazias
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
        // Filtra entradas vazias
        const validEducation = data.education.filter(edu => edu.course || edu.institution || edu.conclusionYear );
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
        const validCertifications = data.certifications.filter(cert => cert.name || cert.issuer || cert.year );
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
                ${/* Título Profissional REMOVIDO */''}
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
        // Verifica se há qualquer informação de contato
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
                        ${/* Título Profissional REMOVIDO */''}
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
        
        // Aplica as variáveis CSS
        document.documentElement.style.setProperty('--primary-color', selectedPrimaryColor);
        document.documentElement.style.setProperty('--secondary-color', selectedSecondaryColor);

        let html = '';
        if (data.template === 'template-modelo1') {
            html = renderModelo1(data);
        } else if (data.template === 'template-modelo2') {
            html = renderModelo2(data);
        }
        
        // Define a classe do contêiner principal para aplicar o CSS correto do template
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
        croppieInstance.bind({
            url: image
        });
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
    
    // Converte a imagem cortada em DataURL e armazena na variável global
    async function cropAndSetPhoto() {
        if (croppieInstance) {
            try {
                const result = await croppieInstance.result({
                    type: 'base64',
                    size: 'viewport',
                    format: 'jpeg',
                    quality: 0.8
                });
                photoDataURL = result;
                croppieContainer.style.display = 'none'; // Oculta a ferramenta de corte após aplicar
                generateResume(); // Re-renderiza o currículo com a nova foto
            } catch (error) {
                console.error("Erro ao cortar a imagem:", error);
                // Em caso de erro, apenas gera o resumo sem foto ou com a foto anterior
                generateResume();
            }
        } else {
            // Se o usuário não cortou, mas selecionou uma foto, não faz nada (a foto ainda não está em photoDataURL)
            // No fluxo atual, photoDataURL é setado apenas após o corte.
        }
    }


    /* -------------------- Funções de Download (Com validação da IA) -------------------- */
    
    window.jsPDF = window.jspdf.jsPDF;

    async function downloadPdf() {
        const element = resumePreview;
        if (!element) {
            updateAssistant('alerta', '❌ Pré-visualização não encontrada. Tente recarregar a página.');
            return;
        }

        // 1. Clona o elemento para isolar a renderização
        const clone = element.cloneNode(true);
        
        // 2. Salva estilos originais para restaurar depois
        const originalStyle = element.style.cssText;
        const previewWasHidden = element.style.display === 'none' || element.style.display === '';

        // 3. Aplica estilos de impressão ao clone para garantir que o layout A4 seja respeitado
        clone.style.width = '210mm'; // Largura A4
        clone.style.minHeight = '297mm'; // Altura A4
        clone.style.margin = '0'; // Otimização
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
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 0;

        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // CORREÇÃO: Altera a condição de >= 0 para > 2 (2mm de margem/buffer) para evitar uma página extra em branco
        while (heightLeft > 2) { 
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        const nome = (getFormData().nomeCompleto || 'Curriculo').replace(/[^a-zA-Z0-9]/g, '_');
        pdf.save(`${nome}_CurriculoFacil.pdf`);
    }


    /* -------------------- Funções de Cor -------------------- */
    
    const defaultColors = [
        { primary: '#2a3eb1', secondary: '#e8f0fe' }, // Azul Padrão
        { primary: '#008000', secondary: '#e6ffe6' }, // Verde
        { primary: '#8B0000', secondary: '#ffeded' }, // Vinho/Bordô
        { primary: '#000000', secondary: '#eeeeee' }, // Preto/Cinza
        { primary: '#5D3FD3', secondary: '#efebff' }, // Roxo
        { primary: '#ff8c00', secondary: '#fff5e6' }  // Laranja
    ];

    function initializeColorPicker() {
        const colorOptionsDiv = document.getElementById('colorOptions');
        if (!colorOptionsDiv) return;

        defaultColors.forEach((color, index) => {
            const option = document.createElement('div');
            option.className = 'color-option';
            option.style.backgroundColor = color.primary;
            option.title = `Cor Primária: ${color.primary}`;
            option.setAttribute('data-primary', color.primary);
            option.setAttribute('data-secondary', color.secondary);

            if (index === 0) { 
                // Seleciona a primeira cor como padrão
                option.classList.add('selected');
            }

            option.addEventListener('click', () => {
                applyTheme(color.primary, color.secondary);
                document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });

            colorOptionsDiv.appendChild(option);
        });

        // Aplica o tema padrão no início
        applyTheme(defaultColors[0].primary, defaultColors[0].secondary);
    }

    function applyTheme(primary, secondary) {
        selectedPrimaryColor = primary;
        selectedSecondaryColor = secondary;
        document.documentElement.style.setProperty('--primary-color', primary);
        document.documentElement.style.setProperty('--secondary-color', secondary);
        generateResume();
    }


    /* -------------------- Eventos (MAIN) -------------------- */
    
    // 1. **INICIALIZAÇÃO DO ASSISTENTE**
    setupAssistant();
    monitorAllInputs(); // Inicia a monitorização dos campos
    updateAssistant('neutro', 'Tudo certo. Estou aqui se precisar de dicas!');


    // 2. LISTENERS PRINCIPAIS DE FORMULÁRIO
    document.getElementById('resumeForm')?.addEventListener('input', updateInput);
    addEducationBtn?.addEventListener('click', () => addEducationEntry({}));
    addExperienceBtn?.addEventListener('click', () => addExperienceEntry({}));
    addCertificationBtn?.addEventListener('click', () => addCertificationEntry({}));
    templateRadioButtons.forEach(radio => radio.addEventListener('change', (e) => {
        templateId = e.target.value;
        generateResume();
    }));


    // 3. LISTENERS DE FOTO
    photoInput?.addEventListener('change', handlePhotoUpload);
    hidePhotoCheckbox?.addEventListener('change', generateResume);


    // 4. Botão de Pré-visualização (generateResumeButton)
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

    // 5. Botão de Download PDF (Com Validação da IA)
    if(downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', async () => {
            const data = getFormData();
            
            // Validação mínima: Nome e Email
            const nomeValido = data.nomeCompleto && data.nomeCompleto.trim().length >= 5 && data.nomeCompleto.split(' ').length >= 2;
            const emailValido = data.email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email.trim());

            if (!nomeValido || !emailValido) {
                 updateAssistant('alerta', 
                    '🛑 **Atenção! Currículo Incompleto!** Por favor, verifique se seu **Nome Completo** e **Email** estão preenchidos corretamente antes de baixar.', 
                    true
                );
                 return; // Impede a chamada de downloadPdf
            }

            // Se for válido, informa e prossegue
            updateAssistant('feliz', '🎉 Download iniciado! Parabéns pelo seu novo currículo!', true);
            downloadPdf();
        });
    } else {
        console.error("ERRO: Botão 'downloadPdf' não encontrado. Verifique o ID no HTML.");
    }
    
    // 6. Inicialização
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
    generateResume();
});