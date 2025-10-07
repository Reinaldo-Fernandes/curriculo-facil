Nome Completo

Rua: Endereço Aqui
Telefone: (00) 0000-0000
Email: exemplo@dominio.com
LinkedIn: linkedin.com/in/exemplo

-----------------------------------------

Resumo Profissional
Texto do resumo aqui...

-----------------------------------------

Habilidades
Habilidade 1, Habilidade 2, ...

-----------------------------------------

Idiomas
Idioma 1: Fluente, Idioma 2: Intermediário, ...

-----------------------------------------

Atividades Extracurriculares
Descrição das atividades...

-----------------------------------------

Experiência Profissional
Cargo
Nome da Empresa | Local | Mês/Ano de Início – Mês/Ano de Término
Responsabilidade 1: Descrição breve...
Responsabilidade 2: Descrição breve...

-----------------------------------------

Educação
Nome do Curso
Instituição | Local | Mês/Ano de Início – Mês/Ano de Término
Destaque 1: Descrição breve...
Destaque 2: Descrição breve...

-----------------------------------------

Projetos
Nome do Projeto
Breve descrição do projeto...

-----------------------------------------

Certificações
Nome da Certificação
Instituição | Data de Conclusão
Descrição breve...

------------------
    // ----------------------------------------------------
    // --- Lógica de Cores e Temas ---
    // ----------------------------------------------------

    function initializeColorPicker() {
        const colors = ['#2a3eb1', '#2196f3', '#009688', '#e91e63', '#ff9800', '#607d8b']; // Paleta de cores
        let pickerHtml = '<p>Selecione um tema:</p><div style="display: flex; gap: 10px; margin-top: 10px;">';
        
        colors.forEach(color => {
            pickerHtml += `<div class="color-option" style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; border: 2px solid #ccc;" data-color="${color}"></div>`;
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

        // Atualiza as variáveis CSS para todo o documento (afeta header, botões)
        document.documentElement.style.setProperty('--primary-color', selectedPrimaryColor);
        document.documentElement.style.setProperty('--secondary-color', selectedSecondaryColor);
        
        // Aplica a cor do rodapé
        const footer = document.querySelector('footer');
        if (footer) footer.style.backgroundColor = selectedPrimaryColor;
        
        // Força a atualização do preview com as novas cores
        resumePreview.style.setProperty('--selected-primary-color', selectedPrimaryColor);
        resumePreview.style.setProperty('--selected-secondary-color', selectedSecondaryColor);
        
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


    initializeColorPicker();

-----------------------
