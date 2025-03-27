document.addEventListener("DOMContentLoaded", function () {
    const resumePreview = document.getElementById("resumePreview");

    if (!resumePreview) {
        console.error("❌ Erro: Elemento resumePreview não encontrado.");
        return;
    }

    function showResumePreview() {
        if (window.innerWidth <= 768) { // Modo mobile
            resumePreview.style.display = "block"; 
            resumePreview.style.opacity = "1";
            resumePreview.style.flexDirection = "column"; // Ajusta o layout
        } else { // Modo desktop
            resumePreview.style.display = "flex"; 
            resumePreview.style.flexDirection = "row";
        }
    }

    // Executa ao carregar a página
    showResumePreview();

    // Atualiza caso a tela seja redimensionada
    window.addEventListener("resize", showResumePreview);
});
