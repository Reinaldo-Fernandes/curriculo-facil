document.addEventListener("DOMContentLoaded", function () {
    const generateResumeButton = document.querySelector("#generateResumeButton");
    const resumePreview = document.querySelector("#resumePreview");

    if (!generateResumeButton || !resumePreview) {
        console.error("❌ Erro: Elementos não encontrados no DOM.");
        return;
    }

    function showResumePreview() {
        if (window.innerWidth <= 768) { 
            resumePreview.classList.add("mobile-view");
            resumePreview.classList.remove("desktop-view");
        } else {
            resumePreview.classList.add("desktop-view");
            resumePreview.classList.remove("mobile-view");
        }
    }

    // Executar a função ao carregar a página para definir o layout corretamente
    showResumePreview();
    window.addEventListener("resize", showResumePreview);

    generateResumeButton.addEventListener("click", function () {
        console.log("✅ Botão de gerar currículo foi clicado!");

        let name = document.querySelector("#name")?.value.trim() || "Nome não informado";
        let email = document.querySelector("#email")?.value.trim() || "Não informado";
        let phone = document.querySelector("#phone")?.value.trim() || "Não informado";
        let experience = document.querySelector("#experience")?.value.trim() || "Nenhuma experiência adicionada";
        let skills = document.querySelector("#skills")?.value.trim() || "Nenhuma habilidade adicionada";

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
        resumePreview.classList.add("visible"); // Usa uma classe CSS para exibição
        console.log("✅ Currículo atualizado no preview!");
    });
});
