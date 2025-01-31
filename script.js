document.addEventListener('DOMContentLoaded', function () {
    // 1. VARIÁVEIS GLOBAIS
    const resumeForm = document.getElementById('resumeForm');
    const photoInput = document.getElementById('photo');
    const resumePreview = document.getElementById('resumePreview');
    const progressBar = document.getElementById('progressBar'); // Barra de progresso
    const progressText = document.getElementById('progressText'); // Texto do progresso
    const fields = Array.from(resumeForm.querySelectorAll('input, textarea')); // Seleciona todos os inputs e textareas
    const downloadPdfBtn = document.getElementById('downloadPdf');
    const downloadWordBtn = document.getElementById('downloadWord');

    // 2. FUNÇÕES AUXILIARES
    function updateProgress() {
        const totalFields = fields.length;
        let filledFields = 0;

        fields.forEach(field => {
            if (field.type === 'file' && field.files && field.files.length > 0) {
                filledFields++;
            } else if (field.value.trim() !== '') {
                filledFields++;
            }
        });

        const progress = Math.min(100, Math.round((filledFields / totalFields) * 100));
        progressBar.value = progress;
        progressText.textContent = `${progress}%`;
    }

    function formatPhone(phoneInput) {
        phoneInput.addEventListener('input', () => {
            let phoneValue = phoneInput.value.replace(/\D/g, '');
            if (phoneValue.length > 11) phoneValue = phoneValue.slice(0, 11);

            if (phoneValue.length === 11) {
                phoneInput.value = `(${phoneValue.slice(0, 2)}) ${phoneValue.slice(2, 7)}-${phoneValue.slice(7, 11)}`;
            } else if (phoneValue.length > 6) {
                phoneInput.value = `(${phoneValue.slice(0, 2)}) ${phoneValue.slice(2, 6)}-${phoneValue.slice(6)}`;
            } else if (phoneValue.length > 2) {
                phoneInput.value = `(${phoneValue.slice(0, 2)}) ${phoneValue.slice(2)}`;
            }
        });
    }

    // Inicializa formatação de telefones
    formatPhone(document.getElementById('phone1'));
    formatPhone(document.getElementById('phone2'));

    function generateResume() {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone1 = document.getElementById('phone1').value;

        if (!name || !email || !phone1) {
            alert("Por favor, preencha os campos obrigatórios.");
            return;
        }

        const resumeData = {
            name: name,
            address: document.getElementById('address').value,
            phone1: phone1,
            phone2: document.getElementById('phone2').value,
            email: email,
            linkedin: document.getElementById('linkedin').value,
            summary: document.getElementById('summary').value,
            photo: photoInput.files.length > 0 ? URL.createObjectURL(photoInput.files[0]) : '',
        };

        resumePreview.style.opacity = "0";
        resumePreview.style.display = "flex";

        setTimeout(() => {
            displayResumePreview(resumeData);
            resumePreview.style.opacity = "1";
            resumePreview.style.transition = "opacity 0.5s ease-in-out";
        }, 100);
    }

    function displayResumePreview(data) {
        const skillsHTML = data.skills && data.skills.length 
            ? `<h3>Habilidades</h3><ul>${data.skills.map(skill => `<li>${skill}</li>`).join('')}</ul>` 
            : '';
    
        const languagesHTML = data.languages && data.languages.length 
            ? `<h3>Idiomas</h3><ul>${data.languages.map(lang => `<li>${lang}</li>`).join('')}</ul>` 
            : '';
    
        resumePreview.innerHTML = `
            <div class="resume-left custom-bg-color">
                ${data.photo ? `<img src="${data.photo}" alt="Foto">` : ''}
                <h2>${data.name}</h2>
                <div class="contact-info">
                    ${data.address ? `<p><strong>Endereço:</strong> ${data.address}</p>` : ''}
                    <p><strong>Telefone 1:</strong> ${data.phone1}</p>
                    ${data.phone2 ? `<p><strong>Telefone 2:</strong> ${data.phone2}</p>` : ''}
                    <p><strong>Email:</strong> ${data.email}</p>
                    ${data.linkedin ? `<p><strong>LinkedIn:</strong> ${data.linkedin}</p>` : ''}
                    ${languagesHTML}
                    ${skillsHTML}
                </div>
            </div>
            <div class="resume-right">
                ${data.summary ? `<div class="summary"><h3>Resumo</h3><p>${data.summary}</p></div>` : ''}
                ${educationHTML}
                ${experienceHTML}
                ${certificationsHTML}
                ${activitiesHTML}
            </div>
        `;
    }
    
    // Evento para exibir prévia da foto antes de gerar o currículo
    photoInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('photoPreview').src = e.target.result;
                document.getElementById('photoPreview').style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // Função para baixar como PDF
    downloadPdfBtn.addEventListener('click', function () {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true,
        });

        html2canvas(resumePreview, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            scrollX: 0,
            scrollY: 0
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 170;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            doc.save('curriculo.pdf');
        });
    });

    // Função para baixar como Word
    document.getElementById('downloadWord').addEventListener('click', function () {
        const resumeContent = document.getElementById('resumePreview').innerHTML;
    
        if (!resumeContent.trim()) {
            alert("Gere o currículo antes de baixar!");
            return;
        }
    
        let documentContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='UTF-8'>
                <title>Currículo</title>
                <link rel="stylesheet" href="./style.css">
            </head>
            <body>
                <div id="resumePreview">
                    ${resumeContent}
                </div>
            </body>
            </html>`;
    
        const blob = new Blob(['\ufeff', documentContent], { type: 'application/msword' });
    
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'curriculo.doc';
    
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    
    
    // Evento para gerar currículo
    document.getElementById('generateResumeButton').addEventListener('click', function (event) {
        event.preventDefault();
        generateResume();
    });
});
