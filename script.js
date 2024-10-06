document.addEventListener('DOMContentLoaded', function() {
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
