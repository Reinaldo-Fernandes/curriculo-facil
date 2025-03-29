document.addEventListener("DOMContentLoaded", function () {
    const generateResumeButton = document.getElementById("generateResumeButton");
    const resumePreview = document.getElementById("resumePreview");

    if (!generateResumeButton || !resumePreview) {
        console.error("❌ Erro: Elementos não encontrados no DOM.");
        return;
    }

    function showResumePreview() {
        if (window.innerWidth <= 768) { 
            resumePreview.style.display = "block"; 
            resumePreview.style.flexDirection = "column"; 
        } else {
            resumePreview.style.display = "flex"; 
            resumePreview.style.flexDirection = "row";
        }
    }

    window.addEventListener("resize", showResumePreview);

    generateResumeButton.addEventListener("click", function () {
        console.log("✅ Botão de gerar currículo foi clicado!");

        // Capturar valores dos campos
        function getValue(id) {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`⚠️ Campo "${id}" não encontrado.`);
                return "Não informado";
            }
            return element.value.trim() || "Não informado";
        }

        let name = getValue("name");
        let email = getValue("email");
        let phone = getValue("phone");
        let experience = getValue("experience");
        let education = getValue("education");
        let skills = getValue("skills");
        let certifications = getValue("certifications");
        let languages = getValue("languages");

        console.log("📌 Dados capturados:", { name, email, phone, experience, education, skills, certifications, languages });

        let resumeHTML = `
            <div class="resume-left">
                <h2>${name}</h2>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Telefone:</strong> ${phone}</p>
                <h2>Educação</h2>
                <p>${education}</p>
            </div>
            <div class="resume-right">
                <h2>Experiência</h2>
                <p>${experience}</p>

                <h2>Habilidades</h2>
                <p>${skills}</p>

                <h2>Certificações</h2>
                <p>${certifications}</p>

                <h2>Idiomas</h2>
                <p>${languages}</p>
            </div>
        `;

        console.log("🔍 HTML do currículo gerado:", resumeHTML);

        resumePreview.innerHTML = resumeHTML;
        resumePreview.style.display = "block";
        resumePreview.style.opacity = "1";

        console.log("✅ Currículo atualizado no preview!");
    });
});
