document.addEventListener("DOMContentLoaded", function () {
    const generateResumeButton = document.getElementById("generateResumeButton");
    const resumePreview = document.getElementById("resumePreview");

    if (!generateResumeButton || !resumePreview) {
        console.error("❌ Erro: Elementos não encontrados no DOM.");
        return;
    }

    generateResumeButton.addEventListener("click", function () {
        console.log("✅ Botão de gerar currículo foi clicado!");

        // Função para capturar valores dos inputs e textareas corretamente
        function getValue(id) {
            const element = document.getElementById(id);
            if (!element) return "Não informado";
            
            // Verifica se é um input, textarea ou outro elemento
            if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
                return element.value.trim() || "Não informado";
            }
            return element.innerText.trim() || "Não informado";
        }

        // Pegando os valores dos campos corretamente
        let name = getValue("name");
        let summary = getValue("summary");
        let email = getValue("email");
        let phone = getValue("phone");
        let experience = getValue("experience");
        let education = getValue("education");
        let skills = getValue("skills");
        let certifications = getValue("certifications");
        let languages = getValue("languages");

        console.log("📌 Dados capturados:", { name, summary, phone, experience, education, skills, certifications, languages });

        // Captura a foto, se existir
        let profilePicture = document.getElementById("profilePicture");
        let profileImageUrl = "";

        if (profilePicture && profilePicture.files && profilePicture.files.length > 0) {
            const file = profilePicture.files[0];
            profileImageUrl = URL.createObjectURL(file);
        }

        let imageTag = profileImageUrl
            ? `<img src="${profileImageUrl}" alt="Foto de perfil" class="resume-photo">`
            : "<p>Sem foto</p>";

        // Gerando o HTML do currículo
        let resumeHTML = `
            <div class="resume-left">
                ${imageTag}
                <h2>${name}</h2>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Telefone:</strong> ${phone}</p>
            </div>
            <div class="resume-right">
                <h2>Resumo Profissional</h2>
                <p>${summary}</p>

                <h2>Experiência</h2>
                <p>${experience}</p>

                <h2>Educação</h2>
                <p>${education}</p>

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
