// Wait for the page to load
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".container");
  const addButton = document.getElementById("addProject");
  const modal = document.getElementById("projectModal");
  const closeModalBtn = document.querySelector("#projectModal .close");
  const form = document.getElementById("projectForm");
  let editingCard = null;

  const pieChart = new Chart(document.getElementById("projectChart"), {
    type: "pie",
    data: {
      labels: [],
      datasets: [
        {
          label: "",
          data: [],
          backgroundColor: [],
        },
      ],
    },
  });

  // --- Random color generator ---
  function getRandomColor() {
    const arr = [
      "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40",
      "#FFCD56", "#C9CBCF", "#2ecc71", "#e74c3c", "#3498db", "#f1c40f",
      "#9b59b6", "#1abc9c", "#34495e", "#fd79a8", "#55efc4", "#ffeaa7",
      "#74b9ff", "#a29bfe",
    ];
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // --- Save to localStorage ---
  function saveProjects() {
    const projects = [];
    document.querySelectorAll(".project").forEach((card) => {
      projects.push({
        fname: card.dataset.name,
        lname: card.dataset.hours,
        photo: card.querySelector("img").src,
      });
    });

    const chartData = {
      labels: pieChart.data.labels,
      data: pieChart.data.datasets[0].data,
      colors: pieChart.data.datasets[0].backgroundColor,
    };

    localStorage.setItem("projectsData", JSON.stringify(projects));
    localStorage.setItem("chartData", JSON.stringify(chartData));
  }

  // --- Load from localStorage ---
  function loadProjects() {
    const savedProjects = JSON.parse(localStorage.getItem("projectsData") || "[]");
    const savedChart = JSON.parse(localStorage.getItem("chartData") || "{}");

    if (savedProjects.length > 0) {
      savedProjects.forEach((p) => {
        const card = renderProject(p);
        container.appendChild(card);
      });
    }

    if (savedChart.labels) {
      pieChart.data.labels = savedChart.labels;
      pieChart.data.datasets[0].data = savedChart.data;
      pieChart.data.datasets[0].backgroundColor = savedChart.colors;
      pieChart.update();
    }
  }

  // --- Reset modal properly ---
  function resetFormAndCloseModal() {
    form.reset();
    editingCard = null;
    if (modal) modal.style.display = "none";
  }

  // --- Handle form submit (Add or Edit) ---
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const photoInput = document.getElementById("projectPhoto");
    let projectData = {};

    for (let element of form.elements) {
      if (
        (element.tagName === "INPUT" || element.tagName === "TEXTAREA") &&
        element.type != "file"
      ) {
        projectData[element.name] = element.value;
      }
    }

    const file = photoInput.files[0];

    // --- Editing existing card ---
    if (editingCard != null) {
      const oldName = editingCard.dataset.name;
      const newName = projectData.fname;
      const newHours = projectData.lname;
      const newPhotoFile = file;

      editingCard.querySelector("h2").textContent = `Project: ${newName}`;
      editingCard.querySelector("p").textContent = `Hours: ${newHours} hrs this week`;
      editingCard.dataset.name = newName;
      editingCard.dataset.hours = newHours;

      const index = pieChart.data.labels.indexOf(oldName);
      if (index !== -1) {
        pieChart.data.labels[index] = newName;
        pieChart.data.datasets[0].data[index] = newHours;
      } else {
        pieChart.data.labels.push(newName);
        pieChart.data.datasets[0].data.push(newHours);
        pieChart.data.datasets[0].backgroundColor.push(getRandomColor());
      }

      if (newPhotoFile) {
        const reader = new FileReader();
        reader.onload = function (e) {
          editingCard.querySelector("img").src = e.target.result;
          saveProjects();
        };
        reader.readAsDataURL(newPhotoFile);
      } else {
        saveProjects();
      }

      pieChart.update();
      resetFormAndCloseModal();
      return;
    }

    // --- Adding a new card ---
    const addNewProject = (photo) => {
      projectData.photo = photo;
      const card = renderProject(projectData);
      container.appendChild(card);

      pieChart.data.labels.push(projectData.fname);
      pieChart.data.datasets[0].data.push(Number(projectData.lname));
      pieChart.data.datasets[0].backgroundColor.push(getRandomColor());
      pieChart.update();

      saveProjects();
      resetFormAndCloseModal();
    };

    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        addNewProject(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      addNewProject("");
    }
  });

  // --- Create card ---
  function renderProject(projectData) {
    document.querySelector("#projectModal .close").click();
    document.getElementById("projectForm").reset();

    const card = document.createElement("div");
    card.classList.add("project");

    const title = document.createElement("h2");
    title.textContent = `Project: ${projectData.fname}`;

    const hours = document.createElement("p");
    hours.textContent = `Hours: ${projectData.lname} hrs this week`;

    const photo = document.createElement("img");
    photo.src = projectData.photo || "";
    photo.style.width = "100%";

    card.append(title, hours, photo);
    card.dataset.name = projectData.fname;
    card.dataset.hours = projectData.lname;

    return card;
  }

  // --- Click on project to edit ---
  document.addEventListener("click", function (event) {
    const card = event.target.closest(".project");
    if (!card) return;

    editingCard = card;
    document.getElementById("addProject").click();

    const name = card.dataset.name;
    const hours = card.dataset.hours;

    document.querySelector('#projectForm input[name="fname"]').value = name;
    document.querySelector('#projectForm input[name="lname"]').value = hours;
  });

  // --- Fix: Clear form when adding new project ---
  addButton.addEventListener("click", () => {
    editingCard = null;
    form.reset();
    const fileInput = document.getElementById("projectPhoto");
    if (fileInput) fileInput.value = "";
  });

  // --- Close modal manually ---
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", resetFormAndCloseModal);
  }

  // --- Load saved projects on startup ---
  loadProjects();
});
