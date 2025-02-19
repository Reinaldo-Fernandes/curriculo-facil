document.addEventListener('DOMContentLoaded', function () {
    // 📌 VARIÁVEIS GLOBAIS
    const resumeForm = document.getElementById('resumeForm');
    const resumePreview = document.getElementById('resumePreview');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const downloadPdfBtn = document.getElementById('downloadPdf');
    const generateResumeButton = document.getElementById('generateResumeButton');

    // 1️⃣ ✅ CORREÇÃO: GERAR CURRÍCULO FUNCIONANDO
    function generateResume() {
        console.log("🚀 Função generateResume chamada!"); // Debug

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone1 = document.getElementById('phone1').value.trim();

        if (!name || !email || !phone1) {
            alert("Preencha os campos obrigatórios.");
            return;
        }

        resumePreview.style.display = "flex";
        resumePreview.style.flexDirection = "row";
        resumePreview.style.opacity = "1";

        // ✅ CORREÇÃO: Captura da imagem correta
        const photoInput = document.getElementById('photo');
        let imageUrl = "default-photo.jpg"; // Caso não tenha imagem

        if (photoInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.querySelector('.resume-left img').src = e.target.result;
            };
            reader.readAsDataURL(photoInput.files[0]);
        }

        // Dados do currículo
        const resumeData = {
            name,
            email,
            phone1,
            phone2: document.getElementById('phone2').value,
            linkedin: document.getElementById('linkedin').value,
            summary: document.getElementById('summary').value.trim(),
            skills: document.getElementById('skills').value.split(',').map(s => s.trim()).filter(Boolean),
            languages: document.getElementById('languages').value.split(',').map(l => l.trim()).filter(Boolean),
            education: document.getElementById('educationContainer').innerHTML,
            experience: document.getElementById('experienceContainer').innerHTML,
            certifications: document.getElementById('certificationsContainer').innerHTML,
            activities: document.getElementById('activities').value.trim()
        };

        // ✅ Gera a pré-visualização corretamente
        resumePreview.innerHTML = `
            <div class="resume-left">
                <img src="${imageUrl}" alt="Foto do Candidato" />
                <h2>${resumeData.name}</h2>
                <p><strong>Email:</strong> ${resumeData.email}</p>
                <p><strong>Telefone:</strong> ${resumeData.phone1}</p>
                ${resumeData.phone2 ? `<p><strong>Telefone 2:</strong> ${resumeData.phone2}</p>` : ''}
                ${resumeData.linkedin ? `<p><strong>LinkedIn:</strong> ${resumeData.linkedin}</p>` : ''}
                ${resumeData.skills.length ? `<h3>Habilidades</h3><ul>${resumeData.skills.map(s => `<li>${s}</li>`).join('')}</ul>` : ''}
                ${resumeData.languages.length ? `<h3>Idiomas</h3><ul>${resumeData.languages.map(l => `<li>${l}</li>`).join('')}</ul>` : ''}
            </div>
            <div class="resume-right">
                <h3>Educação</h3>${resumeData.education}
                <h3>Experiência Profissional</h3>${resumeData.experience}
                <h3>Certificações</h3>${resumeData.certifications}
                ${resumeData.activities ? `<h3>Atividades Extracurriculares</h3><p>${resumeData.activities}</p>` : ''}
            </div>
        `;

        // 🔍 🚀 Verifica erros ortográficos após gerar o currículo
        checkSpelling(resumeData);
    }

    generateResumeButton.addEventListener('click', function (event) {
        event.preventDefault();
        generateResume();
    });

    // 2️⃣ ✅ ADICIONADO CORRETOR ORTOGRÁFICO
    function checkSpelling(resumeData) {
        console.log("📝 Verificando ortografia...");

        // Concatena todos os textos inseridos no currículo
        const textToCheck = [
            resumeData.summary,
            resumeData.skills.join(', '),
            resumeData.languages.join(', '),
            resumeData.activities
        ].join("\n");

        // Chamada para API de correção ortográfica
        fetch('https://api.languagetool.org/v2/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `language=pt-BR&text=${encodeURIComponent(textToCheck)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.matches.length > 0) {
                alert(`⚠️ Foram encontrados ${data.matches.length} erros ortográficos.`);
                console.log("Erros:", data.matches);
            } else {
                console.log("✅ Nenhum erro ortográfico encontrado.");
            }
        })
        .catch(error => console.error("Erro ao verificar ortografia:", error));
    }

    // 3️⃣ ✅ DOWNLOAD DO PDF
    downloadPdfBtn.addEventListener('click', function () {
        if (!resumePreview.innerHTML.trim()) {
            alert("Gere o currículo antes de baixar o PDF.");
            return;
        }

        const options = {
            margin: [10, 10, 10, 10], 
            filename: 'curriculo.pdf',
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 4, useCORS: true, allowTaint: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(options).from(resumePreview).save();
    });

});
