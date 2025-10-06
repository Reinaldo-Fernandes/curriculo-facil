document.addEventListener("DOMContentLoaded", () => {
  const summary = document.getElementById("summary");
  const summaryCounter = document.getElementById("summaryCounter");
  const photoInput = document.getElementById("photo");
  const photoPreview = document.getElementById("photoPreview");
  const generateBtn = document.getElementById("generateResumeButton");
  const downloadBtn = document.getElementById("downloadPdf");
  const resumePreview = document.getElementById("resumePreview");

  // Atualiza contador
  summary.addEventListener("input", () => {
    summaryCounter.textContent = `${summary.value.length} / 600 caracteres`;
    generateResume();
  });

  // Preview da foto
  photoInput.addEventListener("change", () => {
    const file = photoInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      photoPreview.src = e.target.result;
      photoPreview.style.display = "block";
      generateResume();
    };
    reader.readAsDataURL(file);
  });

  // Campos dinâmicos
  function setupDynamic(addId, containerId, template) {
    const addBtn = document.getElementById(addId);
    const container = document.getElementById(containerId);
    addBtn.addEventListener("click", () => {
      const el = document.createElement("div");
      el.classList.add("entry");
      el.innerHTML = template;
      container.appendChild(el);
      el.querySelector(".remove").addEventListener("click", () => {
        el.remove();
        generateResume();
      });
      el.querySelectorAll("input, textarea").forEach(i =>
        i.addEventListener("input", generateResume)
      );
      generateResume();
    });
  }

  setupDynamic(
    "addExperience",
    "experienceContainer",
    `
    <div class="entry">
      <label>Cargo:</label>
      <input class="exp-title" type="text" placeholder="Cargo / Função">
      <label>Empresa:</label>
      <input class="exp-company" type="text" placeholder="Empresa">
      <label>Período:</label>
      <input class="exp-period" type="text" placeholder="2020 - 2024">
      <label>Descrição:</label>
      <textarea class="exp-desc" placeholder="Principais responsabilidades e resultados."></textarea>
      <button type="button" class="remove">Remover</button>
    </div>`
  );

  setupDynamic(
    "addEducation",
    "educationContainer",
    `
    <div class="entry">
      <label>Curso:</label>
      <input class="edu-course" type="text" placeholder="Curso">
      <label>Instituição:</label>
      <input class="edu-inst" type="text" placeholder="Instituição">
      <label>Período:</label>
      <input class="edu-period" type="text" placeholder="2018 - 2022">
      <button type="button" class="remove">Remover</button>
    </div>`
  );

  setupDynamic(
    "addCertification",
    "certificationsContainer",
    `
    <div class="entry">
      <label>Certificação:</label>
      <input class="cert-name" type="text" placeholder="Nome da certificação">
      <label>Instituição:</label>
      <input class="cert-inst" type="text" placeholder="Instituição">
      <label>Descrição:</label>
      <textarea class="cert-desc" placeholder="Descrição ou foco."></textarea>
      <button type="button" class="remove">Remover</button>
    </div>`
  );

  // Gera visual do currículo
  function generateResume() {
    const data = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone1").value,
      linkedin: document.getElementById("linkedin").value,
      address: document.getElementById("address").value,
      summary: document.getElementById("summary").value,
      skills: document.getElementById("skills").value.split(",").map(s => s.trim()).filter(Boolean),
      languages: document.getElementById("languages").value.split(",").map(s => s.trim()).filter(Boolean),
      activities: document.getElementById("activities").value,
      photo: photoPreview.src
    };

    const exp = [...document.querySelectorAll("#experienceContainer .entry")].map(e => ({
      title: e.querySelector(".exp-title").value,
      company: e.querySelector(".exp-company").value,
      period: e.querySelector(".exp-period").value,
      desc: e.querySelector(".exp-desc").value
    }));

    const edu = [...document.querySelectorAll("#educationContainer .entry")].map(e => ({
      course: e.querySelector(".edu-course").value,
      inst: e.querySelector(".edu-inst").value,
      period: e.querySelector(".edu-period").value
    }));

    const cert = [...document.querySelectorAll("#certificationsContainer .entry")].map(e => ({
      name: e.querySelector(".cert-name").value,
      inst: e.querySelector(".cert-inst").value,
      desc: e.querySelector(".cert-desc").value
    }));

    resumePreview.innerHTML = `
      <div class="resume-left">
        ${data.photo ? `<img src="${data.photo}" alt="Foto">` : ""}
        <h2>${data.name || "Seu Nome"}</h2>
        <h3>Contato</h3>
        <ul>
          ${data.email ? `<li><i class="fa-solid fa-envelope"></i> ${data.email}</li>` : ""}
          ${data.phone ? `<li><i class="fa-solid fa-phone"></i> ${data.phone}</li>` : ""}
          ${data.linkedin ? `<li><i class="fa-brands fa-linkedin"></i> ${data.linkedin}</li>` : ""}
          ${data.address ? `<li><i class="fa-solid fa-location-dot"></i> ${data.address}</li>` : ""}
        </ul>

        ${data.skills.length ? `<h3>Habilidades</h3><ul>${data.skills.map(s => `<li>${s}</li>`).join("")}</ul>` : ""}
        ${data.languages.length ? `<h3>Idiomas</h3><ul>${data.languages.map(l => `<li>${l}</li>`).join("")}</ul>` : ""}
      </div>

      <div class="resume-right">
        <section>
          <h3>Resumo Profissional</h3>
          <p>${data.summary || "Escreva aqui um breve resumo profissional."}</p>
        </section>

        <section>
          <h3>Experiência Profissional</h3>
          ${exp.map(e => `<div><h4>${e.title} - ${e.company}</h4><p><strong>${e.period}</strong></p><p>${e.desc}</p></div>`).join("") || "<p>Sem experiências registradas.</p>"}
        </section>

        <section>
          <h3>Educação</h3>
          ${edu.map(e => `<div><h4>${e.course}</h4><p>${e.inst} (${e.period})</p></div>`).join("") || "<p>Sem formação registrada.</p>"}
        </section>

        ${cert.length ? `<section><h3>Certificações</h3>${cert.map(c => `<div><h4>${c.name}</h4><p>${c.inst} - ${c.desc}</p></div>`).join("")}</section>` : ""}
        ${data.activities ? `<section><h3>Atividades Complementares</h3><p>${data.activities}</p></section>` : ""}
      </div>`;
  }

  generateBtn.addEventListener("click", generateResume);

  // Gera PDF em alta qualidade
  downloadBtn.addEventListener("click", () => {
    generateResume();
    const el = document.getElementById("resumePreview");
    const opt = {
      margin: [0, 0, 0, 0],
      filename: "curriculo_profissional.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 4, dpi: 400, useCORS: true, scrollY: 0 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "avoid-all"] }
    };
    html2pdf().set(opt).from(el).save();
  });

  generateResume();
});
