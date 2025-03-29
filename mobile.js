document.addEventListener("DOMContentLoaded", function () {
    const resumePreview = document.getElementById("resumePreview");
    const generateButton = document.getElementById("generateResume");

    if (!resumePreview || !generateButton) {
        console.error("❌ Erro: Elementos não encontrados no DOM.");
        return;
    }

    function showResumePreview() {
        if (window.innerWidth <= 768) { 
            resumePreview.style.display = "block"; 
            resumePreview.style.opacity = "1";
            resumePreview.style.flexDirection = "column"; 
        } else {
            resumePreview.style.display = "flex"; 
            resumePreview.style.flexDirection = "row";
        }
    }

    window.addEventListener("resize", showResumePreview);

    generateButton.addEventListener("click", function () {
        console.log("✅ Botão de gerar currículo foi clicado!");

        let name = document.getElementById("name")?.value.trim() || "Nome não informado";
        let email = document.getElementById("email")?.value.trim() || "Não informado";
        let phone = document.getElementById("phone")?.value.trim() || "Não informado";
        let experience = document.getElementById("experience")?.value.trim() || "Nenhuma experiência adicionada";
        let skills = document.getElementById("skills")?.value.trim() || "Nenhuma habilidade adicionada";

        console.log("📌 Dados capturados:", { name, email, phone, experience, skills });

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

        console.log("🔍 HTML do currículo gerado:", resumeHTML);

        resumePreview.innerHTML = resumeHTML;
        resumePreview.style.display = "block";
        resumePreview.style.opacity = "1";
        resumePreview.style.visibility = "visible";
        resumePreview.style.position = "relative";
        resumePreview.style.zIndex = "100";

        console.log("✅ Currículo atualizado no preview!");
    });
});
