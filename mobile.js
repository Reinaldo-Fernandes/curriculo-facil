document.addEventListener("DOMContentLoaded", function () {
    const resumePreview = document.getElementById("resumePreview");
    const generateButton = document.getElementById("generateResume");

    if (!resumePreview || !generateButton) {
        console.error("❌ Erro: Elementos não encontrados.");
        return;
    }

    function showResumePreview() {
        console.log("Ajustando preview para:", window.innerWidth <= 768 ? "Mobile" : "Desktop");
        if (window.innerWidth <= 768) { 
            resumePreview.style.display = "block"; 
            resumePreview.style.opacity = "1";
            resumePreview.style.flexDirection = "column"; 
        } else {
            resumePreview.style.display = "flex"; 
            resumePreview.style.flexDirection = "row";
        }
    }

    // Executa ao carregar a página
    showResumePreview();
    window.addEventListener("resize", showResumePreview);

    generateButton.addEventListener("click", function () {
        let name = document.getElementById("name")?.value.trim() || "Nome não informado";
        let email = document.getElementById("email")?.value.trim() || "Não informado";
        let phone = document.getElementById("phone")?.value.trim() || "Não informado";
        let experience = document.getElementById("experience")?.value.trim() || "Nenhuma experiência adicionada";
        let skills = document.getElementById("skills")?.value.trim() || "Nenhuma habilidade adicionada";

        console.log("Gerando currículo com os dados:", { name, email, phone, experience, skills });

        let resumeHTML = `
            <div class="resume-left">
                <h2>${name}</h2>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Telefone:</strong> ${phone}</p>
            </div>
            <div class="resume-right">
                <h2>Experiência</h2>
                <p>${experience}</p>
                
                <h2>Habilidades</h2>
                <p>${skills}</p>
            </div>
        `;

        resumePreview.innerHTML = resumeHTML;
        resumePreview.style.display = "block";
        resumePreview.style.opacity = "1";
        resumePreview.style.flexDirection = "column"; // Garante layout certo no mobile

        console.log("Currículo gerado com sucesso!");
    });

    // Executa ao carregar a página
    showResumePreview();

    // Atualiza caso a tela seja redimensionada
    window.addEventListener("resize", showResumePreview);
});

document.getElementById("generateResume").addEventListener("click", function () {
    // Pegando valores dos campos de entrada
    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let phone = document.getElementById("phone").value.trim();
    let experience = document.getElementById("experience").value.trim();
    let skills = document.getElementById("skills").value.trim();

    // Verifica se pelo menos um campo foi preenchido
    if (!name && !email && !phone && !experience && !skills) {
        alert("Preencha pelo menos um campo para gerar o currículo!");
        return;
    }

    // Criando a estrutura do currículo
    let resumeHTML = `
        <div class="resume-left">
            <h2>${name || "Nome não informado"}</h2>
            <p><strong>Email:</strong> ${email || "Não informado"}</p>
            <p><strong>Telefone:</strong> ${phone || "Não informado"}</p>
        </div>
        <div class="resume-right">
            <h2>Experiência</h2>
            <p>${experience || "Nenhuma experiência adicionada"}</p>
            
            <h2>Habilidades</h2>
            <p>${skills || "Nenhuma habilidade adicionada"}</p>
        </div>
    `;

    // Adicionando o conteúdo ao preview
    let resumePreview = document.getElementById("resumePreview");
    resumePreview.innerHTML = resumeHTML;

    // Exibindo o preview corretamente
    resumePreview.style.display = "block";
    resumePreview.style.opacity = "1";
});
