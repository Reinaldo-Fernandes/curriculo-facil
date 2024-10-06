document.addEventListener('DOMContentLoaded', function() {
    // Prevenir o comportamento padrão do formulário e gerar currículo
    document.getElementById('resumeForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevenir recarregamento da página

        // Captura os dados do formulário
        const resumeData = captureResumeData();

        // Atualize a pré-visualização ou faça outra ação, como salvar o currículo em PDF
        displayResumePreview(resumeData);
    });

    // Função para capturar os dados do formulário
    function captureResumeData() {
        const name = document.getElementById('name').value;
        const address = document.getElementById('address').value;
        const phone1 = document.getElementById('phone1').value;
        const phone2 = document.getElementById('phone2').value;
        const email = document.getElementById('email').value;
        const linkedin = document.getElementById('linkedin').value;

        // Captura os dados da experiência
        const experienceEntries = Array.from(document.querySelectorAll('.experience-entry')).map(entry => ({
            jobTitle: entry.querySelector('.job-title').value,
            companyName: entry.querySelector('.company-name').value,
            jobDates: entry.querySelector('.job-dates').value,
            jobResponsibilities: entry.querySelector('.job-responsibilities').value,
        }));

        // Captura os dados da educação
        const educationEntries = Array.from(document.querySelectorAll('.education-entry')).map(entry => ({
            degree: entry.querySelector('.degree').value,
            institution: entry.querySelector('.institution').value,
            graduationDate: entry.querySelector('.graduation-date').value,
        }));

        // Captura os dados dos projetos
        const projectEntries = Array.from(document.querySelectorAll('.project-entry')).map(entry => ({
            projectName: entry.querySelector('.project-name').value,
            projectDescription: entry.querySelector('.project-description').value,
        }));

        return {
            name,
            address,
            phone1,
            phone2,
            email,
            linkedin,
            experienceEntries,
            educationEntries,
            projectEntries,
        };
    }

    // Exibir os dados capturados na pré-visualização
    function displayResumePreview(data) {
        const previewContainer = document.getElementById('resumePreview');
        previewContainer.innerHTML = `
            <h2>Pré-visualização do Currículo</h2>
            <p><strong>Nome:</strong> ${data.name}</p>
            <p><strong>Endereço:</strong> ${data.address}</p>
            <p><strong>Telefone 1:</strong> ${data.phone1}</p>
            <p><strong>Telefone 2:</strong> ${data.phone2}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>LinkedIn:</strong> ${data.linkedin}</p>
            <h3>Experiência Profissional</h3>
            ${data.experienceEntries.map(entry => `
                <div>
                    <p><strong>Cargo:</strong> ${entry.jobTitle}</p>
                    <p><strong>Empresa:</strong> ${entry.companyName}</p>
                    <p><strong>Duração:</strong> ${entry.jobDates}</p>
                    <p><strong>Responsabilidades:</strong> ${entry.jobResponsibilities}</p>
                </div>
            `).join('')}
            <h3>Educação</h3>
            ${data.educationEntries.map(entry => `
                <div>
                    <p><strong>Grau:</strong> ${entry.degree}</p>
                    <p><strong>Instituição:</strong> ${entry.institution}</p>
                    <p><strong>Data de Graduação:</strong> ${entry.graduationDate}</p>
                </div>
            `).join('')}
            <h3>Projetos</h3>
            ${data.projectEntries.map(entry => `
                <div>
                    <p><strong>Nome do Projeto:</strong> ${entry.projectName}</p>
                    <p><strong>Descrição:</strong> ${entry.projectDescription}</p>
                </div>
            `).join('')}
        `;
    }

    // Função para adicionar novas entradas e limpá-las
    function addEntry(containerId, templateClass) {
        const container = document.getElementById(containerId);
        const template = document.querySelector(`.${templateClass}`).cloneNode(true);

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

    // Swiper.js - Navegação por slides para Experiência Profissional
    const swiper = new Swiper('.swiper-container', {
        slidesPerView: 1,
        spaceBetween: 10,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
        }
    });
});
