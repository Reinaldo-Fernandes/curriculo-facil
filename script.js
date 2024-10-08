document.addEventListener('DOMContentLoaded', function () {
    const resumeForm = document.getElementById('resumeForm');
    const photoInput = document.getElementById('photo');
    const resumePreview = document.getElementById('resumePreview');
    let photoURL = ''; // Guardar o URL da imagem aqui

    // Captura da imagem selecionada sem exibir ainda
    photoInput.addEventListener('change', function (event) {
        if (photoInput.files && photoInput.files[0]) {
            const photo = photoInput.files[0];
            photoURL = URL.createObjectURL(photo); // Armazena a URL da imagem
        }
    });

    // Função para adicionar entrada de certificação
    document.getElementById('addCertification').addEventListener('click', function () {
        const certificationsContainer = document.getElementById('certificationsContainer');
        const newEntry = document.createElement('div');
        newEntry.classList.add('certification-entry');
        newEntry.innerHTML = `
            <input type="text" class="certification-name" placeholder="Nome da Certificação">
            <input type="text" class="certification-institution" placeholder="Instituição | Data de Conclusão">
            <textarea class="certification-description" placeholder="Descrição breve, se necessário."></textarea>
            <button type="button" class="remove-button">Remover <i class="fa-solid fa-user-xmark"></i></button>
        `;
        certificationsContainer.appendChild(newEntry);

        newEntry.querySelector('.remove-button').addEventListener('click', function () {
            certificationsContainer.removeChild(newEntry);
        });
    });

    // Função para adicionar entrada de educação
    document.getElementById('addEducation').addEventListener('click', function () {
        const educationContainer = document.getElementById('educationContainer');
        const newEntry = document.createElement('div');
        newEntry.classList.add('education-entry');
        newEntry.innerHTML = `
            <input type="text" class="degree" placeholder="Nome do Curso">
            <input type="text" class="institution" placeholder="Instituição | Local">
            <input type="text" class="education-dates" placeholder="Mês/Ano de Início – Mês/Ano de Término">
            <textarea class="education-highlights" placeholder="Destaques"></textarea>
            <button type="button" class="remove-button">Remover <i class="fa-solid fa-user-xmark"></i></button>
        `;
        educationContainer.appendChild(newEntry);

        newEntry.querySelector('.remove-button').addEventListener('click', function () {
            educationContainer.removeChild(newEntry);
        });
    });

    // Função para adicionar entrada de experiência
    document.getElementById('addExperience').addEventListener('click', function () {
        const experienceContainer = document.getElementById('experienceContainer');
        const newEntry = document.createElement('div');
        newEntry.classList.add('experience-entry');
        newEntry.innerHTML = `
            <input type="text" class="job-title" placeholder="Cargo">
            <input type="text" class="company-name" placeholder="Nome da Empresa | Local">
            <input type="text" class="job-dates" placeholder="Mês/Ano de Início – Mês/Ano de Término">
            <textarea class="job-responsibilities" placeholder="Responsabilidades"></textarea>
            <button type="button" class="remove-button">Remover <i class="fa-solid fa-user-xmark"></i></button>
        `;
        experienceContainer.appendChild(newEntry);

        newEntry.querySelector('.remove-button').addEventListener('click', function () {
            experienceContainer.removeChild(newEntry);
        });
    });

    // Função para adicionar entrada de projetos
    document.getElementById('addProject').addEventListener('click', function () {
        const projectsContainer = document.getElementById('projectsContainer');
        const newEntry = document.createElement('div');
        newEntry.classList.add('project-entry');
        newEntry.innerHTML = `
            <input type="text" class="project-name" placeholder="Nome do Projeto">
            <textarea class="project-description" placeholder="Breve descrição do projeto, tecnologias usadas e o resultado final."></textarea>
            <button type="button" class="remove-button">Remover <i class="fa-solid fa-user-xmark"></i></button>
        `;
        projectsContainer.appendChild(newEntry);

        newEntry.querySelector('.remove-button').addEventListener('click', function () {
            projectsContainer.removeChild(newEntry);
        });
    });

    // Função para mostrar a mensagem de erro
    function showError(input, message) {
        let errorElement = input.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('error-message')) {
            errorElement = document.createElement('small');
            errorElement.className = 'error-message';
            errorElement.style.color = 'red';
            input.insertAdjacentElement('afterend', errorElement);
        }
        errorElement.innerText = message;
    }

    // Função para remover a mensagem de erro
    function removeError(input) {
        let errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.remove();
        }
    }

    // Função para validar o formulário
    function validateForm() {
        let isValid = true;
        const nameValue = document.getElementById('name').value.trim();
        if (nameValue.split(' ').length < 2) {
            showError(document.getElementById('name'), 'Por favor, insira seu nome completo.');
            isValid = false;
        } else {
            removeError(document.getElementById('name'));
        }

        const addressValue = document.getElementById('address').value.trim();
        if (addressValue === '') {
            showError(document.getElementById('address'), 'Por favor, insira seu endereço.');
            isValid = false;
        } else {
            removeError(document.getElementById('address'));
        }

        const phone1Value = document.getElementById('phone1').value.trim();
        if (phone1Value.length < 14) {
            showError(document.getElementById('phone1'), 'Por favor, insira um número de telefone válido.');
            isValid = false;
        } else {
            removeError(document.getElementById('phone1'));
        }

        const emailValue = document.getElementById('email').value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailValue)) {
            showError(document.getElementById('email'), 'Por favor, insira um email válido.');
            isValid = false;
        } else {
            removeError(document.getElementById('email'));
        }

        return isValid;
    }

    // Função para gerar a pré-visualização do currículo
    function generateResumePreview() {
        const name = document.getElementById('name').value.trim();
        const address = document.getElementById('address').value.trim();
        const phone1 = document.getElementById('phone1').value.trim();
        const phone2 = document.getElementById('phone2').value.trim();
        const email = document.getElementById('email').value.trim();
        const linkedin = document.getElementById('linkedin').value.trim();
        const summary = document.getElementById('summary').value.trim();
        const skills = document.getElementById('skills').value.trim();
        const languages = document.getElementById('languages').value.trim();
        const activities = document.getElementById('activities').value.trim();

        let educationEntries = '';
        document.querySelectorAll('.education-entry').forEach(entry => {
            const degree = entry.querySelector('.degree').value.trim();
            const institution = entry.querySelector('.institution').value.trim();
            const dates = entry.querySelector('.education-dates').value.trim();
            const highlights = entry.querySelector('.education-highlights').value.trim();
            educationEntries += `
                <h4>${degree} - ${institution}</h4>
                <p>${dates}</p>
                <p>${highlights}</p>
            `;
        });

        let experienceEntries = '';
        document.querySelectorAll('.experience-entry').forEach(entry => {
            const jobTitle = entry.querySelector('.job-title').value.trim();
            const companyName = entry.querySelector('.company-name').value.trim();
            const jobDates = entry.querySelector('.job-dates').value.trim();
            const responsibilities = entry.querySelector('.job-responsibilities').value.trim();
            experienceEntries += `
                <h4>${jobTitle} - ${companyName}</h4>
                <p>${jobDates}</p>
                <p>${responsibilities}</p>
            `;
        });

        let certificationEntries = '';
        document.querySelectorAll('.certification-entry').forEach(entry => {
            const certificationName = entry.querySelector('.certification-name').value.trim();
            const certificationInstitution = entry.querySelector('.certification-institution').value.trim();
            const certificationDescription = entry.querySelector('.certification-description').value.trim();
            certificationEntries += `
                <h4>${certificationName} - ${certificationInstitution}</h4>
                <p>${certificationDescription}</p>
            `;
        });

        let projectEntries = '';
        document.querySelectorAll('.project-entry').forEach(entry => {
            const projectName = entry.querySelector('.project-name').value.trim();
            const projectDescription = entry.querySelector('.project-description').value.trim();
            projectEntries += `
                <h4>${projectName}</h4>
                <p>${projectDescription}</p>
            `;
        });

        resumePreview.innerHTML = `
            <div class="resume-container">
                <div class="header">
                    <div class="personal-info">
                        <h2>${name}</h2>
                        ${address ? `<p>Endereço: ${address}</p>` : ''}
                        <p>Telefone: ${phone1}</p>
                        ${phone2 ? `<p>Telefone 2: ${phone2}</p>` : ''}
                        <p>Email: ${email}</p>
                        ${linkedin ? `<p>LinkedIn: ${linkedin}</p>` : ''}
                        ${photoURL ? `<img src="${photoURL}" alt="Foto" style="max-width: 150px; border-radius: 50%;">` : ''}
                    </div>
                </div>
                ${summary ? `<h3>Resumo</h3><p>${summary}</p>` : ''}
                ${educationEntries ? `<h3>Educação</h3>${educationEntries}` : ''}
                ${experienceEntries ? `<h3>Experiência Profissional</h3>${experienceEntries}` : ''}
                ${certificationEntries ? `<h3>Certificações</h3>${certificationEntries}` : ''}
                ${skills ? `<h3>Habilidades</h3><p>${skills}</p>` : ''}
                ${projectEntries ? `<h3>Projetos</h3>${projectEntries}` : ''}
                ${languages ? `<h3>Idiomas</h3><p>${languages}</p>` : ''}
                ${activities ? `<h3>Atividades Extracurriculares</h3><p>${activities}</p>` : ''}
            </div>
        `;
    }

    // Formatação do telefone
    document.getElementById('phone1').addEventListener('input', function (event) {
        event.target.value = event.target.value
            .replace(/\D/g, '') // Remove caracteres não numéricos
            .replace(/(\d{2})(\d)/, '($1) $2') // Formato do DDD
            .replace(/(\d{5})(\d)/, '$1-$2') // Formato do número
            .slice(0, 15); // Limite de caracteres
    });

    document.getElementById('phone2').addEventListener('input', function (event) {
        event.target.value = event.target.value
            .replace(/\D/g, '') // Remove caracteres não numéricos
            .replace(/(\d{2})(\d)/, '($1) $2') // Formato do DDD
            .replace(/(\d{5})(\d)/, '$1-$2') // Formato do número
            .slice(0, 15); // Limite de caracteres
    });

    // Envio do formulário e validação
    resumeForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Previne o envio padrão
        if (validateForm()) {
            generateResumePreview(); // Gera a pré-visualização se válido
        }
    });
});
