document.addEventListener('DOMContentLoaded', function () {
    // --- elementos DOM ---
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

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phone1Input = document.getElementById('phone1');
    const skillsInput = document.getElementById('skills');
    const languagesInput = document.getElementById('languages');

    const MAX_SUMMARY_LENGTH = 600;
    summaryInput.setAttribute('maxlength', MAX_SUMMARY_LENGTH);

    // Variável para armazenar base64 da foto (garante render correto)
    let photoBase64 = '';

    // --- FUNÇÕES DE FORMATAÇÃO (REGRAS DO CLIENTE) ---
    
    /**
     * Formata o telefone para (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.
     * @param {string} phone - O número de telefone.
     * @returns {string} - O número formatado.
     */
    function formatPhoneNumber(phone) {
        if (!phone) return '';
        const digits = phone.replace(/\D/g, ''); // Remove tudo que não for dígito
        
        // Formato (XX) XXXXX-XXXX (11 dígitos, ex: 9XXXX)
        if (digits.length === 11) {
            return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7, 11)}`;
        } 
        // Formato (XX) XXXX-XXXX (10 dígitos)
        if (digits.length === 10) {
            return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6, 10)}`;
        }
        // Retorna o original se não tiver um formato reconhecido
        return phone; 
    }

    /**
     * Tenta formatar o endereço para 'Rua: XXX N: XX, Complemento: YYY'
     * @param {string} address - O endereço completo (ex: Rua Exemplo, 123, Apto 404).
     * @returns {string} - O endereço formatado.
     */
    function formatAddress(address) {
        if (!address) return '';
        
        // Divide o endereço por vírgula para tentar identificar as partes
        const parts = address.split(',').map(p => p.trim()).filter(Boolean);
        
        let rua = parts[0] || address;
        let numero = '';
        let complemento = '';

        // Tenta encontrar o número.
        if (parts.length > 1) {
            // Se o segundo elemento contiver apenas dígitos e até 5 caracteres (heurística para número), ele é o número.
            if (parts[1].match(/^\d{1,5}$/)) {
                numero = parts[1];
            } else {
                // Caso contrário, tenta encontrar um padrão 'N: XX' ou 'n XX'
                const numMatch = parts[1].match(/(\d+)$/);
                if (numMatch) {
                    numero = numMatch[1];
                }
            }
        }
        
        if (parts.length > 2) {
            // O restante é o complemento
            complemento = parts.slice(numero ? 2 : 1).join(', ');
        }
        
        // Ajustando a lógica de saída para garantir o formato desejado (Rua: XXX N: XX, se tiver complemento: XXX)
        let output = `Rua: ${rua}`;
        if (numero) {
            output += ` N: ${numero}`;
        }
        if (complemento) {
            // Usamos a vírgula para separar o número do complemento e 'Complemento: ' para o rótulo
            output += `, Complemento: ${complemento}`;
        }
        
        return output;
    }
    // --- FIM FUNÇÕES DE FORMATAÇÃO ---

    // --- Preview da foto (com conversão para base64) ---
    photoInput.addEventListener('change', () => {
        const file = photoInput.files && photoInput.files[0];
        if (!file) {
            photoBase64 = '';
            photoPreview.src = '';
            photoPreview.style.display = 'none';
            return;
        }
        const reader = new FileReader();
        reader.onload = function (e) {
            photoBase64 = e.target.result;
            photoPreview.src = photoBase64;
            photoPreview.style.display = 'block';
            // atualiza preview já com imagem
            generateResume();
        };
        reader.readAsDataURL(file);
    });

    // --- contador de caracteres ---
    summaryInput.addEventListener('input', () => {
        summaryCounter.textContent = `${summaryInput.value.length} / ${MAX_SUMMARY_LENGTH} caracteres`;
    });

    // --- progresso ---
    function updateProgress() {
        // CORREÇÃO: Certificando-se de que a barra de progresso e o texto existem
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
        if (!container) return;
        const entry = document.createElement('div');
        entry.className = 'entry';
        entry.innerHTML = html;
        container.appendChild(entry);
        const removeBtn = entry.querySelector('.remove-button');
        if (removeBtn) removeBtn.addEventListener('click', () => { container.removeChild(entry); updateProgress(); });
        updateProgress();
    }

    // CORREÇÃO: Substituindo o uso de '?.addEventListener' por checagem de IF para evitar erro de execução.
    const addExperienceBtn = document.getElementById('addExperienceBtn');
    if (addExperienceBtn) {
        addExperienceBtn.addEventListener('click', () => {
            addField('experienceContainer', `
                <div class="experience-entry">
                    <label>Cargo</label><input type="text" class="experience-title" placeholder="Cargo">
                    <label>Empresa</label><input type="text" class="experience-company" placeholder="Empresa">
                    <label>Período</label><input type="text" class="experience-duration" placeholder="Data de Início - Data de Término">
                    <label>Descrição</label><textarea class="experience-description" placeholder="Descrição"></textarea>
                    <button type="button" class="remove-button">Remover</button>
                </div>
            `);
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
            addField('certificationContainer', `
                <div class="certification-entry">
                    <label>Nome</label><input type="text" class="certification-name" placeholder="Nome da Certificação">
                    <label>Instituição</label><input type="text" class="certification-institution" placeholder="Instituição">
                    <label>Descrição</label><textarea class="certification-description" placeholder="Descrição"></textarea>
                    <button type="button" class="remove-button">Remover</button>
                </div>
            `);
        });
    }


    // --- Geração do objeto de dados (para montar o preview) ---
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

    // --- Gera o preview HTML ---
    function generateResume() {
        if (!nameInput || !emailInput || !phone1Input) return false; // Fail safe

        // validação mínima
        if (!nameInput.value.trim() || !emailInput.value.trim() || !phone1Input.value.trim()) {
            // Apenas exibe erro se o usuário tentar atualizar ou baixar
            return false;
        }
        
        errorMessageDiv.style.display = 'none';
        nameInput.classList.remove('input-error');
        emailInput.classList.remove('input-error');
        phone1Input.classList.remove('input-error');

        // coletar entradas dinâmicas
        const experience = collectDynamic('experienceContainer', ['experience-title','experience-company','experience-duration','experience-description']);
        const education = collectDynamic('educationContainer', ['education-title','education-institution','education-duration']);
        const certifications = collectDynamic('certificationContainer', ['certification-name','certification-institution','certification-description']);

        // --- PROCESSAMENTO DE DADOS COM AS NOVAS REGRAS ---
        // 1. Nome com quebra de linha (quebra no último espaço)
        let formattedName = nameInput.value.trim();
        const lastSpaceIndex = formattedName.lastIndexOf(' ');
        if (lastSpaceIndex !== -1) {
            // Insere um <br> antes do último nome/sobrenome para forçar a quebra de linha
            formattedName = formattedName.substring(0, lastSpaceIndex) + '<br>' + formattedName.substring(lastSpaceIndex + 1);
        }

        // 2. Formato de telefone
        const formattedPhone1 = formatPhoneNumber(phone1Input.value.trim());
        const formattedPhone2 = formatPhoneNumber(document.getElementById('phone2').value.trim());
        
        // 3. Formato de endereço
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
            activities: document.getElementById('activities').value.trim()
        };

        // A classe 'resume-photo' em style.css garante o formato circular e o corte centralizado (object-fit: cover)
        const imageHtml = photoBase64 ? `<img src="${photoBase64}" alt="Foto do candidato" class="resume-photo">` : '';

        resumePreview.innerHTML = `
            <div class="resume-content-wrapper">
                <aside class="resume-left custom-bg-color">
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

        updateProgress();
        return true;
    }

    generateResumeButton.addEventListener('click', (e) => { 
        e.preventDefault(); 
        // Adiciona validação ao clicar em atualizar preview
        if (!generateResume()) {
            errorMessageDiv.style.display = 'block';
            errorMessageDiv.textContent = '⚠️ Preencha Nome, Email e Telefone para gerar o currículo.';
        }
    });

    // --- Compartilhar no WhatsApp ---
    shareWhatsAppBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Apenas compartilha se o currículo for válido
        if (!generateResume()) {
             errorMessageDiv.style.display = 'block';
             errorMessageDiv.textContent = '⚠️ Preencha Nome, Email e Telefone para compartilhar.';
             return;
        }

        const name = nameInput.value.trim();
        const summary = summaryInput.value.trim().substring(0,150) + '...';
        const msg = encodeURIComponent(`Olá! Confira meu currículo:\nNome: ${name}\nEmail: ${emailInput.value.trim()}\nResumo: ${summary}`);
        window.open(`https://wa.me/?text=${msg}`, '_blank');
    });

    // --- Função robusta para gerar PDF (clona o preview e captura via html2canvas) ---
    downloadPdfBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        // Apenas gera o PDF se o currículo for válido
        if (!generateResume()) {
             errorMessageDiv.style.display = 'block';
             errorMessageDiv.textContent = '⚠️ Preencha Nome, Email e Telefone para baixar o PDF.';
             return;
        }


        // 1) Cria clone do preview e coloca fora da tela (mantendo estilos inline simples)
        const clone = resumePreview.cloneNode(true);
        clone.style.position = 'absolute';
        clone.style.left = '-9999px';
        clone.style.top = '0';
        clone.style.width = '794px'; // Largura A4 em px aproximada
        clone.style.background = '#ffffff';
        clone.style.color = '#000';
        document.body.appendChild(clone);

        // 2) Aguarda imagens dentro do clone carregarem (inclui base64 imgs)
        const imgs = Array.from(clone.querySelectorAll('img'));
        await Promise.all(imgs.map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(res => { img.onload = img.onerror = res; });
        }));

        // 3) Aguarda um pequeno delay para o browser processar layout
        await new Promise(r => setTimeout(r, 200));

        try {
            // 4) Gera canvas a partir do clone
            const canvas = await html2canvas(clone, {
                scale: 2,            // aumenta resolução
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');

            // 5) Cria PDF com jsPDF e adiciona a imagem (com suporte a múltiplas páginas)
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let position = 0;
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);

            let heightLeft = imgHeight - pdfHeight;
            while (heightLeft > 0) {
                position -= pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save('curriculo.pdf');
        } catch (err) {
            console.error('Erro ao gerar PDF:', err);
            alert('Ocorreu um erro ao gerar o PDF. O problema de ERR_CONTENT_LENGTH_MISMATCH nas bibliotecas de PDF pode ser causado pela rede. Tente novamente mais tarde.');
        } finally {
            // 6) Remove o clone (limpeza)
            document.body.removeChild(clone);
        }
    });

    // CORREÇÃO: Chama as funções de inicialização para que o preview e a barra funcionem imediatamente.
    updateProgress();
    generateResume();
});