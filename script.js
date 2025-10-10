document.addEventListener('DOMContentLoaded', function () {
    // --- Variáveis de Tema ---
    let selectedPrimaryColor = '#2a3eb1'; 
    let selectedSecondaryColor = '#e8f0fe'; 

    // --- elementos DOM ---
    const resumeForm = document.getElementById('resumeForm');
    const resumePreview = document.getElementById('resumePreview');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const downloadPdfBtn = document.getElementById('downloadPdf');
    const generateResumeButton = document.getElementById('generateResumeButton');
    const photoInput = document.getElementById('photo');
    // REMOVIDO: const photoPreview = document.getElementById('photoPreview');
    // NOVO: Elementos para o Croppie e Color Picker
    const croppieContainer = document.getElementById('croppie-container');
    const colorPickerSection = document.getElementById('colorPickerSection');

    const summaryInput = document.getElementById('summary');
    const summaryCounter = document.getElementById('summaryCounter');
    const errorMessageDiv = document.getElementById('error-message');
    const shareWhatsAppBtn = document.getElementById('shareWhatsApp');

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phone1Input = document.getElementById('phone1');
    const skillsInput = document.getElementById('skills');
    const languagesInput = document.getElementById('languages');
    
    // Campo de Atividades Adicionais e seu contador
    const activitiesInput = document.getElementById('activities');
    const activitiesCounter = document.getElementById('activitiesCounter'); 

    // CONSTANTES DE LIMITE DE CARACTERES
    const MAX_SUMMARY_LENGTH = 600;
    const MAX_DESCRIPTION_LENGTH = 250; 

    summaryInput.setAttribute('maxlength', MAX_SUMMARY_LENGTH);
    
    if (activitiesInput) {
        activitiesInput.setAttribute('maxlength', MAX_DESCRIPTION_LENGTH);
    }

    // Variável para armazenar base64 da foto (garante render correto)
    let photoBase64 = '';
    // NOVO: Instância do Croppie
    let croppieInstance = null;

    // --- FUNÇÕES DE FORMATAÇÃO ---
    
    /**
     * Formata o telefone para (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.
     */
    function formatPhoneNumber(phone) {
        if (!phone) return '';
        const digits = phone.replace(/\D/g, ''); 
        
        if (digits.length === 11) {
            return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7, 11)}`;
        } 
        if (digits.length === 10) {
            return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6, 10)}`;
        }
        return phone; 
    }

    /**
     * Tenta formatar o endereço.
     */
    function formatAddress(address) {
        if (!address) return '';
        
        const parts = address.split(',').map(p => p.trim()).filter(Boolean);
        
        let rua = parts[0] || address;
        let numero = '';
        let complemento = '';

        if (parts.length > 1) {
            if (parts[1].match(/^\d{1,5}$/)) {
                numero = parts[1];
            } else {
                const numMatch = parts[1].match(/(\d+)$/);
                if (numMatch) {
                    numero = numMatch[1];
                }
            }
        }
        
        if (parts.length > 2) {
            complemento = parts.slice(numero ? 2 : 1).join(', ');
        }
        
        let output = `${rua}`;
        if (numero) {
            output += `, N: ${numero}`;
        }
        if (complemento) {
            output += `, ${complemento}`;
        }
        
        return output;
    }
    // --- FIM FUNÇÕES DE FORMATAÇÃO ---

    // --- FUNÇÃO DE CONTADOR ---
    
    function setupCounter(textarea, counterElement, maxLength) {
        if (textarea && counterElement) {
            counterElement.textContent = `${textarea.value.length} / ${maxLength} caracteres`;

            textarea.addEventListener('input', () => {
                counterElement.textContent = `${textarea.value.length} / ${maxLength} caracteres`;
            });
        }
    }


    // ----------------------------------------------------
    // --- Lógica do Croppie (Corte da Imagem) ---
    // ----------------------------------------------------
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) {
            photoBase64 = '';
            croppieContainer.style.display = 'none';
            if (croppieInstance) {
                croppieInstance.destroy();
                croppieInstance = null;
            }
            generateResume();
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            // Se já existe uma instância, destrói para evitar duplicidade
            if (croppieInstance) {
                croppieInstance.destroy();
            }

            // Inicializa o Croppie no container
            croppieContainer.style.display = 'block';
            croppieInstance = new Croppie(croppieContainer, {
                // Configura o visualizador como um círculo
                viewport: { width: 150, height: 150, type: 'circle' }, 
                boundary: { width: 250, height: 250 },
                enableZoom: true,
                showZoomer: true,
            });

            // Carrega a imagem no Croppie
            croppieInstance.bind({
                url: event.target.result
            });
        };
        reader.readAsDataURL(file);
    });

    /**
     * Pega o Base64 da imagem cortada/ajustada pelo Croppie.
     */
    async function getCroppedImage() {
        if (!croppieInstance) return '';

        try {
            // Captura o resultado do crop em alta resolução
            const result = await croppieInstance.result({
                type: 'base64',
                size: { width: 300, height: 300 }, // Resolução maior para melhor qualidade no PDF
                format: 'png',
                quality: 1
            });
            return result;
        } catch (error) {
            console.error('Erro ao gerar imagem cortada:', error);
            return '';
        }
    }
    // ----------------------------------------------------
    // --- Fim Lógica Croppie ---
    // ----------------------------------------------------


    // --- contadores e progresso ---
    summaryInput.addEventListener('input', () => {
        summaryCounter.textContent = `${summaryInput.value.length} / ${MAX_SUMMARY_LENGTH} caracteres`;
    });
    
    if (activitiesInput && activitiesCounter) {
        setupCounter(activitiesInput, activitiesCounter, MAX_DESCRIPTION_LENGTH);
    }

    function updateProgress() {
        if (!progressBar || !progressText) return; 

        const fields = Array.from(resumeForm.querySelectorAll('input:not([type="file"]), textarea, select'));
        const filled = fields.filter(f => f.value && f.value.trim() !== '').length;
        const total = fields.length || 1;
        const progress = Math.round((filled / total) * 100);
        progressBar.value = progress;
        progressText.textContent = `${progress}%`;
    }
    resumeForm.addEventListener('input', updateProgress);

    // --- campos dinâmicos ---
    function addField(containerId, html) {
        const container = document.getElementById(containerId);
        if (!container) return null;
        const entry = document.createElement('div');
        entry.className = 'entry';
        entry.innerHTML = html;
        container.appendChild(entry);
        const removeBtn = entry.querySelector('.remove-button');
        if (removeBtn) removeBtn.addEventListener('click', () => { container.removeChild(entry); updateProgress(); });
        updateProgress();
        return entry;
    }

    const addExperienceBtn = document.getElementById('addExperienceBtn');
    if (addExperienceBtn) {
        addExperienceBtn.addEventListener('click', () => {
            const newEntry = addField('experienceContainer', `
                <div class="experience-entry">
                    <label>Cargo</label><input type="text" class="experience-title" placeholder="Cargo">
                    <label>Empresa</label><input type="text" class="experience-company" placeholder="Empresa">
                    <label>Período</label><input type="text" class="experience-duration" placeholder="Data de Início - Data de Término">
                    <label>Descrição</label><textarea class="experience-description" placeholder="Descrição" maxlength="${MAX_DESCRIPTION_LENGTH}"></textarea>
                    <div class="description-counter">0 / ${MAX_DESCRIPTION_LENGTH} caracteres</div>
                    <button type="button" class="remove-button">Remover</button>
                </div>
            `);
            if (newEntry) {
                const newTextArea = newEntry.querySelector('.experience-description');
                const newCounter = newEntry.querySelector('.description-counter');
                setupCounter(newTextArea, newCounter, MAX_DESCRIPTION_LENGTH);
            }
        });
    }

    const addEducationBtn = document.getElementById('addEducationBtn');
    if (addEducationBtn) {
        addEducationBtn.addEventListener('click', () => {
            addField('educationContainer', `
                <div class="education-entry">
                    <label>Nome do Curso</label><input type="text" class="education-title" placeholder="Nome do Curso">
                    <label>Instituição</label><input type="text" class="education-institution" placeholder="Instituição">
                    <label>Período</label><input type="text" class="education-duration" placeholder="Período">
                    <button type="button" class="remove-button">Remover</button>
                </div>
            `);
        });
    }

    const addCertificationBtn = document.getElementById('addCertificationBtn');
    if (addCertificationBtn) {
        addCertificationBtn.addEventListener('click', () => {
            const newEntry = addField('certificationContainer', `
                <div class="certification-entry">
                    <label>Nome</label><input type="text" class="certification-name" placeholder="Nome da Certificação">
                    <label>Instituição</label><input type="text" class="certification-institution" placeholder="Instituição">
                    <label>Descrição</label><textarea class="certification-description" placeholder="Descrição" maxlength="${MAX_DESCRIPTION_LENGTH}"></textarea>
                    <div class="description-counter">0 / ${MAX_DESCRIPTION_LENGTH} caracteres</div>
                    <button type="button" class="remove-button">Remover</button>
                </div>
            `);
             if (newEntry) {
                const newTextArea = newEntry.querySelector('.certification-description');
                const newCounter = newEntry.querySelector('.description-counter');
                setupCounter(newTextArea, newCounter, MAX_DESCRIPTION_LENGTH);
            }
        });
    }


    function collectDynamic(containerId, classes) {
        const container = document.getElementById(containerId);
        if (!container) return [];
        return Array.from(container.children).map(entry => {
            const data = {};
            classes.forEach(cls => {
                const el = entry.querySelector('.' + cls);
                data[cls] = el ? el.value.trim() : '';
            });
            return data;
        }).filter(obj => Object.values(obj).some(v => v !== ''));
    }

    // --- Gera o preview HTML (AGORA É ASYNC!) ---
    async function generateResume() { 
        if (!nameInput || !emailInput || !phone1Input) return false;

        if (!nameInput.value.trim() || !emailInput.value.trim() || !phone1Input.value.trim()) {
            return false;
        }
        
        errorMessageDiv.style.display = 'none';
        nameInput.classList.remove('input-error');
        emailInput.classList.remove('input-error');
        phone1Input.classList.remove('input-error');

        // COLETANDO A IMAGEM CORTADA ANTES DE GERAR O PREVIEW
        photoBase64 = await getCroppedImage();


        const experience = collectDynamic('experienceContainer', ['experience-title','experience-company','experience-duration','experience-description']);
        const education = collectDynamic('educationContainer', ['education-title','education-institution','education-duration']);
        const certifications = collectDynamic('certificationContainer', ['certification-name','certification-institution','certification-description']);

        // 🟢 LÓGICA DE QUEBRA DE LINHA DO NOME ATUALIZADA 
        let formattedName = nameInput.value.trim();
        const nameParts = formattedName.split(/\s+/).filter(Boolean); 
        const numWords = nameParts.length;

        if (numWords > 2) {
            // Tenta colocar no máximo 3 palavras por linha, dividindo o restante.
            const firstLineWords = nameParts.slice(0, 3);
            const remainingWords = nameParts.slice(3);
            
            let lines = [firstLineWords.join(' ')];

            if (remainingWords.length > 0) {
                lines.push(remainingWords.join(' '));
            }
            
            formattedName = lines.join('<br>');

        }
        // ⬆️ FIM DA LÓGICA ATUALIZADA


        const formattedPhone1 = formatPhoneNumber(phone1Input.value.trim());
        const formattedPhone2 = formatPhoneNumber(document.getElementById('phone2').value.trim());
        const formattedAddress = formatAddress(document.getElementById('address').value.trim());


        const resumeData = {
            name: nameInput.value.trim(),
            formattedName: formattedName, 
            address: formattedAddress, 
            email: emailInput.value.trim(),
            phone1: formattedPhone1, 
            phone2: formattedPhone2, 
            linkedin: document.getElementById('linkedin').value.trim(),
            summary: summaryInput.value.trim(),
            skills: skillsInput.value.split(',').map(s=>s.trim()).filter(Boolean),
            languages: languagesInput.value.split(',').map(l=>l.trim()).filter(Boolean),
            experience,
            education,
            certifications,
            activities: activitiesInput ? activitiesInput.value.trim() : ''
        };

        const imageHtml = photoBase64 ? `<img src="${photoBase64}" alt="Foto do candidato" class="resume-photo">` : '';

        // Aplica as cores dinâmicas
        resumePreview.innerHTML = `
            <div class="resume-content-wrapper">
                <aside class="resume-left" style="background-color: ${selectedSecondaryColor};">
                    <div>${imageHtml}</div>
                    <h2>${resumeData.formattedName}</h2>
                    ${resumeData.address ? `<p><strong>Endereço:</strong> ${resumeData.address}</p>` : ''}
                    <p><strong>Email:</strong> ${resumeData.email}</p>
                    <p><strong>Telefone:</strong> ${resumeData.phone1}</p>
                    ${resumeData.phone2 ? `<p><strong>Telefone 2:</strong> ${resumeData.phone2}</p>` : ''}
                    ${resumeData.linkedin ? `<p><strong>LinkedIn:</strong> <a href="${resumeData.linkedin}" target="_blank">${resumeData.linkedin}</a></p>` : ''}
                    ${resumeData.languages.length ? `<h4>Idiomas</h4><ul>${resumeData.languages.map(i=>`<li>${i}</li>`).join('')}</ul>` : ''}
                    ${resumeData.skills.length ? `<h4>Habilidades</h4><ul>${resumeData.skills.map(s=>`<li>${s}</li>`).join('')}</ul>` : ''}
                </aside>
                <section class="resume-right">
                    ${resumeData.summary ? `<h3>Resumo Profissional</h3><p>${resumeData.summary}</p>` : ''}
                    ${resumeData.experience.length ? `<h3>Experiência</h3>` + resumeData.experience.map(e=>`<p><strong>${e['experience-title']}</strong> - ${e['experience-company']} (${e['experience-duration']})<br>${e['experience-description']}</p>`).join('') : ''}
                    ${resumeData.education.length ? `<h3>Educação</h3>` + resumeData.education.map(ed=>`<p><strong>${ed['education-title']}</strong> - ${ed['education-institution']} (${ed['education-duration']})</p>`).join('') : ''}
                    ${resumeData.certifications.length ? `<h3>Certificações</h3>` + resumeData.certifications.map(c=>`<p><strong>${c['certification-name']}</strong> - ${c['certification-institution']}<br>${c['certification-description']}</p>`).join('') : ''}
                    ${resumeData.activities ? `<h3>Atividades</h3><p>${resumeData.activities}</p>` : ''}
                </section>
            </div>
        `;

        // Aplica a cor do tema nos títulos da seção direita
        document.querySelector('#resumePreview .resume-right').querySelectorAll('h2, h3, h4').forEach(el => {
            el.style.color = selectedPrimaryColor;
        });

        updateProgress();
        return true;
    }

    generateResumeButton.addEventListener('click', async (e) => { 
        e.preventDefault(); 
        if (! await generateResume()) {
            errorMessageDiv.style.display = 'block';
            errorMessageDiv.textContent = '⚠️ Preencha Nome, Email e Telefone para gerar o currículo.';
        }
    });

    // --- Compartilhar no WhatsApp (AGORA É ASYNC!) ---
    shareWhatsAppBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (! await generateResume()) {
             errorMessageDiv.style.display = 'block';
             errorMessageDiv.textContent = '⚠️ Preencha Nome, Email e Telefone para compartilhar.';
             return;
        }

        const name = nameInput.value.trim();
        const summary = summaryInput.value.trim().substring(0,150) + '...';
        const msg = encodeURIComponent(`Olá! Confira meu currículo:\nNome: ${name}\nEmail: ${emailInput.value.trim()}\nResumo: ${summary}`);
        window.open(`https://wa.me/?text=${msg}`, '_blank');
    });

    // --- Função robusta para gerar PDF (permanece async) ---
    downloadPdfBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (! await generateResume()) {
             errorMessageDiv.style.display = 'block';
             errorMessageDiv.textContent = '⚠️ Preencha Nome, Email e Telefone para baixar o PDF.';
             return;
        }


        // 1) Cria clone do preview e coloca fora da tela
        const clone = resumePreview.cloneNode(true);
        clone.style.position = 'absolute';
        clone.style.left = '-9999px';
        clone.style.top = '0';
        clone.style.width = '794px'; 
        clone.style.background = '#ffffff';
        clone.style.color = '#000';
        document.body.appendChild(clone);

        // 2) Garante que as cores do tema sejam aplicadas no clone para o PDF
        clone.querySelector('.resume-left').style.backgroundColor = selectedSecondaryColor;
        clone.querySelector('.resume-right').querySelectorAll('h2, h3, h4').forEach(el => {
            el.style.color = selectedPrimaryColor;
        });

        // 3) Aguarda imagens
        const imgs = Array.from(clone.querySelectorAll('img'));
        await Promise.all(imgs.map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(res => { img.onload = img.onerror = res; });
        }));

        // 4) Aguarda um pequeno delay
        await new Promise(r => setTimeout(r, 200));

        try {
            // 5) Gera canvas a partir do clone (SCALE 4 para alta qualidade)
            const canvas = await html2canvas(clone, {
                scale: 4, 
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');

            // 6) Cria PDF com jsPDF e adiciona a imagem (com suporte a múltiplas páginas)
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight(); 
            
            const BLANK_PAGE_TOLERANCE_MM = 10; 

            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            
            while (heightLeft > pdfHeight) {
                if (heightLeft - pdfHeight < BLANK_PAGE_TOLERANCE_MM) {
                    break; 
                }
                
                position -= pdfHeight; 
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight; 
            }

            pdf.save('curriculo.pdf');
        } catch (err) {
            console.error('Erro ao gerar PDF:', err);
            alert('Ocorreu um erro ao gerar o PDF. Tente novamente mais tarde.');
        } finally {
            // 7) Remove o clone (limpeza)
            document.body.removeChild(clone);
        }
    });

    // ----------------------------------------------------
    // --- Lógica de Cores e Temas ---
    // ----------------------------------------------------

    function initializeColorPicker() {
        const colors = ['#2a3eb1', '#2196f3', '#009688', '#e91e63', '#ff9800', '#607d8b']; // Paleta de cores
        let pickerHtml = '<p>Selecione um tema:</p><div style="display: flex; gap: 10px; margin-top: 10px;">';
        
        colors.forEach(color => {
            const isSelected = color === selectedPrimaryColor ? ' selected' : '';
            pickerHtml += `<div class="color-option${isSelected}" style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; cursor: pointer;" data-color="${color}"></div>`;
        });
        
        pickerHtml += '</div>';
        colorPickerSection.innerHTML = pickerHtml;

        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', function() {
                const newPrimaryColor = this.getAttribute('data-color');
                applyNewColor(newPrimaryColor);
            });
        });
        
        // Aplica a cor padrão na inicialização
        applyNewColor(selectedPrimaryColor); 
    }

    function applyNewColor(newPrimaryColor) {
        selectedPrimaryColor = newPrimaryColor;
        selectedSecondaryColor = getLightVariant(newPrimaryColor); // Calcula uma variante mais clara para a lateral

        // Remove a classe 'selected' de todos e adiciona ao clicado
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
            if (option.getAttribute('data-color') === newPrimaryColor) {
                option.classList.add('selected');
            }
        });

        // Atualiza as variáveis CSS para todo o documento (afeta header, botões)
        document.documentElement.style.setProperty('--primary-color', selectedPrimaryColor);
        document.documentElement.style.setProperty('--secondary-color', selectedSecondaryColor);
        
        // Força a atualização do preview com as novas cores
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


    // --- Inicialização ---

    function initializeAllDescriptionCounters() {
        if (activitiesInput && activitiesCounter) {
            setupCounter(activitiesInput, activitiesCounter, MAX_DESCRIPTION_LENGTH);
        }
        
        const descriptionTextareas = document.querySelectorAll('.experience-description, .certification-description');
        descriptionTextareas.forEach(textarea => {
            textarea.setAttribute('maxlength', MAX_DESCRIPTION_LENGTH);
            
            let counter = textarea.nextElementSibling;
            if (!counter || !counter.classList.contains('description-counter')) {
                counter = document.createElement('div');
                counter.className = 'description-counter';
                textarea.parentNode.insertBefore(counter, textarea.nextSibling);
            }
            setupCounter(textarea, counter, MAX_DESCRIPTION_LENGTH);
        });
    }

    // Chama as funções de inicialização
    summaryCounter.textContent = `${summaryInput.value.length} / ${MAX_SUMMARY_LENGTH} caracteres`;
    initializeAllDescriptionCounters();
    updateProgress();
    initializeColorPicker(); 
});