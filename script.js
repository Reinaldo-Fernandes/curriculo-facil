document.addEventListener('DOMContentLoaded', function() {
    const resumeForm = document.getElementById('resumeForm');
    const photoInput = document.getElementById('photo');
    const resumePreview = document.getElementById('resumePreview');
    let photoURL = ''; // Guardar o URL da imagem aqui

    // Captura da imagem selecionada sem exibir ainda
    photoInput.addEventListener('change', function(event) {
        if (photoInput.files && photoInput.files[0]) {
            const photo = photoInput.files[0];
            photoURL = URL.createObjectURL(photo); // Armazena a URL da imagem
        }
    });

    // Event Listener para submissão do formulário
    resumeForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const name = document.getElementById('name').value.trim();
        const address = document.getElementById('address').value.trim();
        const phone1 = document.getElementById('phone1').value.trim(); // Corrigido: phone1
        const phone2 = document.getElementById('phone2').value.trim(); // Segundo telefone
        const email = document.getElementById('email').value.trim();
        const linkedin = document.getElementById('linkedin').value.trim();
        const summary = document.getElementById('summary') ? document.getElementById('summary').value.trim() : '';
        const skills = document.getElementById('skills').value.trim();
        const languages = document.getElementById('languages').value.trim();
        const activities = document.getElementById('activities').value.trim();

        // Captura das experiências profissionais
        const experienceEntries = document.querySelectorAll('.experience-entry');
        const experience = Array.from(experienceEntries).map(entry => {
            const jobTitle = entry.querySelector('.job-title').value.trim();
            const companyName = entry.querySelector('.company-name').value.trim();
            const jobDates = entry.querySelector('.job-dates').value.trim();
            const responsibilities = Array.from(entry.querySelectorAll('.job-responsibilities'))
                .map(res => res.value.trim())
                .filter(res => res !== '')
                .map(res => `<li>${res}</li>`)
                .join('');

            return `
                <div class="experience-item">
                    <h4>${jobTitle}</h4>
                    <p><strong>${companyName}</strong> | ${jobDates}</p>
                    <ul>${responsibilities}</ul>
                </div>`;
        }).join('');

        // Renderiza o currículo na visualização e inclui a imagem se ela estiver presente
        resumePreview.innerHTML = `
            <div class="resume-container">
                <div class="header">
                    <div class="personal-info">
                        <h2>${name}</h2>
                        ${address ? `<p>Endereço: ${address}</p>` : ''}
                        <p>Telefone: ${phone1}</p>
                        ${phone2 ? `<p>Telefone 2: ${phone2}</p>` : ''} <!-- Exibe o segundo telefone apenas se preenchido -->
                        <p>Email: ${email}</p>
                        ${linkedin ? `<p>LinkedIn: ${linkedin}</p>` : ''} <!-- Exibe o LinkedIn apenas se preenchido -->
                    </div>
                    <div class="photo-container">
                        ${photoURL ? `<img src="${photoURL}" alt="Foto do Currículo" style="max-width: 150px; border-radius: 50%;">` : ''}
                    </div>
                </div>
                ${summary ? `<hr><section><h3>Resumo Profissional</h3><p>${summary}</p></section>` : ''}
                ${skills ? `<hr><section><h3>Habilidades</h3><p>${skills}</p></section>` : ''}
                ${languages ? `<hr><section><h3>Idiomas</h3><p>${languages}</p></section>` : ''}
                ${activities ? `<hr><section><h3>Atividades Extracurriculares</h3><p>${activities}</p></section>` : ''}
                ${experience ? `<hr><section><h3>Experiência Profissional</h3>${experience}</section>` : ''}
            </div>
        `;

        // Revoga o URL da foto após a exibição
        if (photoURL) {
            URL.createObjectURL(photo);
        }
    });

    // Função para adicionar novas entradas e limpá-las
    function addEntry(containerId, templateClass) {
        const container = document.getElementById(containerId);
        const template = document.querySelector(`.${templateClass}`).cloneNode(true);

        // Limpa os valores dos inputs e textareas
        const inputs = template.querySelectorAll('input');
        inputs.forEach(input => input.value = '');

        const textareas = template.querySelectorAll('textarea');
        textareas.forEach(textarea => textarea.value = '');

        container.appendChild(template);
    }

    // Adicionar Experiência
    document.getElementById('addExperience').addEventListener('click', function() {
        addEntry('experienceContainer', 'experience-entry');
    });

    // Adicionar Educação
    document.getElementById('addEducation').addEventListener('click', function() {
        addEntry('educationContainer', 'education-entry');
    });

    // Adicionar Projeto
    document.getElementById('addProject').addEventListener('click', function() {
        addEntry('projectsContainer', 'project-entry');
    });

    // Adicionar Certificação
    document.getElementById('addCertification').addEventListener('click', function() {
        addEntry('certificationsContainer', 'certification-entry');
    });

    // Função para remover entrada
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('remove-button')) {
            const entry = event.target.closest('.experience-entry, .education-entry, .project-entry, .certification-entry');
            if (entry) {
                entry.remove();
            }
        }
    });

    // Função para formatar o telefone no formato (00) 0000-0000
    function formatPhoneNumber(event) {
        let input = event.target;
        let phoneNumbers = input.value.split(','); // Suporta múltiplos números separados por vírgula
        let formattedNumbers = phoneNumbers.map(phone => {
            let value = phone.replace(/\D/g, ''); // Remove todos os caracteres não numéricos

            // Formatar o número como (00) 0000-0000
            if (value.length > 10) {
                value = value.slice(0, 10); // Limita o tamanho a 10 dígitos
            }

            if (value.length > 6) {
                value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
            } else if (value.length > 2) {
                value = value.replace(/(\d{2})(\d{0,4})/, '($1) $2');
            } else {
                value = value.replace(/(\d{0,2})/, '($1');
            }

            return value;
        });

        // Une os números formatados por vírgula
        input.value = formattedNumbers.join(', ');
    }

    // Aplica a formatação ao campo de telefone
    document.getElementById('phone1').addEventListener('input', formatPhoneNumber); // Corrigido: phone1

    // Download do currículo em PDF
    document.getElementById('downloadPdf').addEventListener('click', function() {
        const element = resumePreview;
        if (element.innerHTML.trim() === '') {
            alert('Por favor, gere o currículo antes de fazer o download.');
            return;
        }
        const opt = {
            margin: 0.5,
            filename: 'curriculo.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    });

    // Download do currículo em Word
    document.getElementById('downloadWord').addEventListener('click', function() {
        const element = resumePreview;
        if (element.innerHTML.trim() === '') {
            alert('Por favor, gere o currículo antes de fazer o download.');
            return;
        }
        const preHtml = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Currículo</title></head><body>`;
        const postHtml = '</body></html>';
        const html = preHtml + element.innerHTML + postHtml;

        const blob = new Blob(['\ufeff', html], { type: 'application/msword' });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'curriculo.doc';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });
});
