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
    const activitiesInput = document.getElementById('activities');
    const activitiesCounter = document.getElementById('activitiesCounter'); 

    const MAX_SUMMARY_LENGTH = 600;
    const MAX_DESCRIPTION_LENGTH = 250; 
    summaryInput.setAttribute('maxlength', MAX_SUMMARY_LENGTH);
    if (activitiesInput) activitiesInput.setAttribute('maxlength', MAX_DESCRIPTION_LENGTH);

    let photoBase64 = '';
    let croppieInstance = null;

    function isMobile() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())) return true;
        if (window.matchMedia("(max-width: 768px)").matches) return true;
        return false;
    }

    function formatPhoneNumber(phone) {
        if (!phone) return '';
        const digits = phone.replace(/\D/g, ''); 
        if (digits.length === 11)
            return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7, 11)}`;
        if (digits.length === 10)
            return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6, 10)}`;
        return phone; 
    }

    function formatAddress(address) {
        if (!address) return '';
        const parts = address.split(',').map(p => p.trim()).filter(Boolean);
        let rua = parts[0] || address, numero = '', complemento = '';
        if (parts.length > 1) {
            if (parts[1].match(/^\d{1,5}$/)) numero = parts[1];
            else {
                const numMatch = parts[1].match(/(\d+)$/);
                if (numMatch) numero = numMatch[1];
            }
        }
        if (parts.length > 2) complemento = parts.slice(numero ? 2 : 1).join(', ');
        let output = `${rua}`;
        if (numero) output += `, N: ${numero}`;
        if (complemento) output += `, ${complemento}`;
        return output;
    }

    function setupCounter(textarea, counterElement, maxLength) {
        if (textarea && counterElement) {
            counterElement.textContent = `${textarea.value.length} / ${maxLength} caracteres`;
            textarea.addEventListener('input', () => {
                counterElement.textContent = `${textarea.value.length} / ${maxLength} caracteres`;
            });
        }
    }

    // --- Lógica do Croppie ---
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) {
            photoBase64 = '';
            croppieContainer.style.display = 'none';
            if (croppieInstance) { croppieInstance.destroy(); croppieInstance = null; }
            generateResume();
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            if (croppieInstance) croppieInstance.destroy();
            croppieContainer.style.display = 'block';
            croppieInstance = new Croppie(croppieContainer, {
                viewport: { width: 150, height: 150, type: 'circle' }, 
                boundary: { width: 250, height: 250 },
                enableZoom: true,
                showZoomer: true,
            });
            croppieInstance.bind({ url: event.target.result });
        };
        reader.readAsDataURL(file);
    });

    async function getCroppedImage() {
        if (!croppieInstance) return '';
        try {
            const result = await croppieInstance.result({
                type: 'base64', size: { width: 300, height: 300 }, format: 'png', quality: 1
            });
            return result;
        } catch (error) {
            console.error('Erro ao gerar imagem cortada:', error);
            return '';
        }
    }

    summaryInput.addEventListener('input', () => {
        summaryCounter.textContent = `${summaryInput.value.length} / ${MAX_SUMMARY_LENGTH} caracteres`;
    });
    if (activitiesInput && activitiesCounter) setupCounter(activitiesInput, activitiesCounter, MAX_DESCRIPTION_LENGTH);

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

    // --- Campos dinâmicos ---
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

    // --- Gera preview ---
    async function generateResume() { 
        if (!nameInput || !emailInput || !phone1Input) return false;
        if (!nameInput.value.trim() || !emailInput.value.trim() || !phone1Input.value.trim()) return false;
        
        errorMessageDiv.style.display = 'none';
        photoBase64 = await getCroppedImage();
        const experience = collectDynamic('experienceContainer', ['experience-title','experience-company','experience-duration','experience-description']);
        const education = collectDynamic('educationContainer', ['education-title','education-institution','education-duration']);
        const certifications = collectDynamic('certificationContainer', ['certification-name','certification-institution','certification-description']);
        let formattedName = nameInput.value.trim();
        const nameParts = formattedName.split(/\s+/).filter(Boolean); 
        if (nameParts.length > 2) {
            const firstLineWords = nameParts.slice(0, 3);
            const remainingWords = nameParts.slice(3);
            formattedName = [firstLineWords.join(' '), remainingWords.join(' ')].filter(Boolean).join('<br>');
        }

        const formattedPhone1 = formatPhoneNumber(phone1Input.value.trim());
        const formattedPhone2 = formatPhoneNumber(document.getElementById('phone2').value.trim());
        const formattedAddress = formatAddress(document.getElementById('address').value.trim());

        const resumeData = {
            name: nameInput.value.trim(),
            formattedName,
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

    // --- DOWNLOAD PDF (corrigido p/ mobile) ---
    downloadPdfBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (! await generateResume()) {
             errorMessageDiv.style.display = 'block';
             errorMessageDiv.textContent = '⚠️ Preencha Nome, Email e Telefone para baixar o PDF.';
             return;
        }

        const clone = resumePreview.cloneNode(true);
        clone.style.position = 'absolute';
        clone.style.left = '-9999px';
        clone.style.top = '0';
        clone.style.width = '794px'; 
        clone.style.background = '#ffffff';
        clone.style.color = '#000';
        document.body.appendChild(clone);

        clone.querySelector('.resume-left').style.backgroundColor = selectedSecondaryColor;
        clone.querySelector('.resume-right').querySelectorAll('h2, h3, h4').forEach(el => el.style.color = selectedPrimaryColor);

        const imgs = Array.from(clone.querySelectorAll('img'));
        await Promise.all(imgs.map(img => img.complete ? null : new Promise(res => img.onload = img.onerror = res)));
        await new Promise(r => setTimeout(r, 200));

        try {
            const canvas = await html2canvas(clone, { scale: 4, useCORS: true, backgroundColor: '#ffffff', logging: false });
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

            // 🔧 Correção: download funcional no mobile
            if (isMobile()) {
                const blob = pdf.output('blob');
                const blobUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = 'curriculo.pdf';
                document.body.appendChild(link);
                link.click();
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(blobUrl);
                }, 1000);
            } else {
                pdf.save('curriculo.pdf');
            }
        } catch (err) {
            console.error('Erro ao gerar PDF:', err);
            alert('Ocorreu um erro ao gerar o PDF. Tente novamente mais tarde.');
        } finally {
            document.body.removeChild(clone);
        }
    });

    // --- Temas e cores ---
    function initializeColorPicker() {
        const colors = ['#2a3eb1', '#2196f3', '#009688', '#e91e63', '#ff9800', '#607d8b'];
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
        applyNewColor(selectedPrimaryColor); 
    }

    function applyNewColor(newPrimaryColor) {
        selectedPrimaryColor = newPrimaryColor;
        selectedSecondaryColor = getLightVariant(newPrimaryColor);
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
            if (option.getAttribute('data-color') === newPrimaryColor) option.classList.add('selected');
        });
        document.documentElement.style.setProperty('--primary-color', selectedPrimaryColor);
        document.documentElement.style.setProperty('--secondary-color', selectedSecondaryColor);
        generateResume();
    }

    function getLightVariant(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        let r = (bigint >> 16) & 255, g = (bigint >> 8) & 255, b = bigint & 255;
        const factor = 0.9;
        r = Math.round(r + (255 - r) * factor);
        g = Math.round(g + (255 - g) * factor);
        b = Math.round(b + (255 - b) * factor);
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }

    // Inicialização
    function initializeAllDescriptionCounters() {
        if (activitiesInput && activitiesCounter) setupCounter(activitiesInput, activitiesCounter, MAX_DESCRIPTION_LENGTH);
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

    summaryCounter.textContent = `${summaryInput.value.length} / ${MAX_SUMMARY_LENGTH} caracteres`;
    initializeAllDescriptionCounters();
    updateProgress();
    initializeColorPicker(); 
});
