document.addEventListener('DOMContentLoaded', function () {
    const resumeForm = document.getElementById('resumeForm');
    const photoInput = document.getElementById('photo');
    const resumePreview = document.getElementById('resumePreview');
    let photoURL = ''; // Guardar o URL da imagem aqui

    // Captura da imagem selecionada sem exibir ainda
    photoInput.addEventListener('change', function (event) {
        if (photoInput.files && photoInput.files[0]) {
            const photo = photoInput.files[0];
            console.log(photo); // Exibe o objeto do arquivo no console
            photoURL = URL.createObjectURL(photo); // Armazena a URL da imagem
        } else {
            console.log("Nenhuma imagem selecionada."); // Para depuração
        }
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

    // Função para validar os campos
    function validateForm() {
        let isValid = true;

        // Validação do Nome
        const nameValue = document.getElementById('name').value.trim();
        if (nameValue.split(' ').length < 2) {
            showError(document.getElementById('name'), 'Por favor, insira seu nome completo (nome e sobrenome).');
            isValid = false;
        } else {
            removeError(document.getElementById('name'));
        }

        // Validação do Endereço
        const addressValue = document.getElementById('address').value.trim();
        if (addressValue === '') {
            showError(document.getElementById('address'), 'Por favor, insira seu endereço.');
            isValid = false;
        } else {
            removeError(document.getElementById('address'));
        }

        // Validação do Telefone
        const phoneValue = document.getElementById('phone1').value.trim();
        if (phoneValue === '' || phoneValue.length < 14) { // Espera o formato (00) 00000-0000
            showError(document.getElementById('phone1'), 'Por favor, insira um número de telefone válido.');
            isValid = false;
        } else {
            removeError(document.getElementById('phone1'));
        }

        // Validação do Email
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

    // Função para gerar a visualização do currículo
    function generateResumePreview() {
        const name = document.getElementById('name').value.trim();
        const address = document.getElementById('address').value.trim();
        const phone1 = document.getElementById('phone1').value.trim();
        const phone2 = document.getElementById('phone2').value.trim();
        const email = document.getElementById('email').value.trim();

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
                        ${photoURL ? `<img src="${photoURL}" alt="Foto do Currículo" style="max-width: 150px; border-radius: 50%;">` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // Função para formatar o telefone enquanto o usuário digita
    function formatPhoneNumber(event) {
        let input = event.target;
        let value = input.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos

        // Formatar o número como (00) 00000-0000
        if (value.length > 11) {
            value = value.slice(0, 11); // Limita o tamanho a 11 dígitos
        }
        if (value.length > 6) {
            value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
        } else if (value.length > 0) {
            value = value.replace(/(\d{0,2})/, '($1');
        }

        input.value = value; // Atualiza o campo com a nova formatação
    }

    // Aplica a formatação ao campo de telefone
    document.getElementById('phone1').addEventListener('input', formatPhoneNumber);
    document.getElementById('phone2').addEventListener('input', formatPhoneNumber);

    // Event listener para o envio do formulário
    resumeForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Previne o envio padrão do formulário

        if (validateForm()) {
            generateResumePreview(); // Gera a visualização do currículo se os campos forem válidos
        }
    });
});
