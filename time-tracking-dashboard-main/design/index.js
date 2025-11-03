// Wait for the page to load
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".container");
  const addButton = document.getElementById("addProject");
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

  function getRandomColor() {
    let arr = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
      "#FFCD56",
      "#C9CBCF",
      "#2ecc71",
      "#e74c3c",
      "#3498db",
      "#f1c40f",
      "#9b59b6",
      "#1abc9c",
      "#34495e",
      "#fd79a8",
      "#55efc4",
      "#ffeaa7",
      "#74b9ff",
      "#a29bfe",
    ];

    let max = arr.length;
    const randomInt = Math.floor(Math.random() * max);
    return arr[randomInt];
  }

  document
    .getElementById("projectForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      if (editingCard === null) {
        const photoInput = document.getElementById("projectPhoto");
        let forum = document.getElementById("projectForm");
        let projectData = {};

        for (let element of forum.elements) {
          if (
            (element.tagName === "INPUT" || element.tagName === "TEXTAREA") &&
            element.type != "file"
          ) {
            console.log(element.name, element.value);
            projectData[element.name] = element.value;

          }
        }

        const file = photoInput.files[0];

        if (file) {
          const reader = new FileReader();
          reader.onload = function (e) {
            projectData.photo = e.target.result;
            const card = renderProject(projectData);
            container.appendChild(card);

          };

          pieChart.data.labels.push(projectData.fname);
          pieChart.data.datasets[0].data.push(Number(projectData.lname));
          pieChart.data.datasets[0].backgroundColor.push(getRandomColor());

          pieChart.update();
          reader.readAsDataURL(file);
        } else {
          pieChart.data.labels.push(projectData.fname);
          pieChart.data.datasets[0].data.push(Number(projectData.lname));
          pieChart.data.datasets[0].backgroundColor.push(getRandomColor());

          pieChart.update();
          const card = renderProject(projectData);
          container.appendChild(card);
        }
      } else if (editingCard != null) {
        const oldName = editingCard.dataset.name;
        const newName = document.querySelector(
          '#projectForm input[name="fname"]'
        ).value;
        const newHours = document.querySelector(
          '#projectForm input[name="lname"]'
        ).value;
        const newPhotoFile = document.getElementById("projectPhoto").files[0];

        editingCard.querySelector("h2").textContent = `Project: ${newName}`;
        editingCard.querySelector(
          "p"
        ).textContent = `Hours: ${newHours} hrs this week`;
        pieChart.update();

        const index = pieChart.data.labels.indexOf(oldName);

        if (index !== -1) {
          pieChart.data.labels[index] = newName;
          pieChart.data.datasets[0].data[index] = newHours;
        } else {
          pieChart.data.labels.push(newName);
          pieChart.data.datasets[0].data.push(newHours);
          pieChart.data.datasets[0].backgroundColor.push(getRandomColor());
        }

        pieChart.update();

        if (newPhotoFile) {
          const reader = new FileReader();
          reader.onload = function (e) {
            console.log(newPhotoFile);
            document.getElementById("projectPhoto").src = newPhotoFile;
          };
          reader.readAsDataURL(newPhotoFile);
        }

        editingCard.dataset.name = newName;
        editingCard.dataset.hours = newHours;

        document.querySelector("#projectModal .close").click();
        document.getElementById("projectForm").reset();
        editingCard = null;
      }
    });

  function renderProject(projectData) {
    document.querySelector("#projectModal .close").click();
    document.getElementById("projectForm").reset();



    console.log(projectData);
    const card = document.createElement("div");
    card.setAttribute("id", "myUniqueDiv");
    card.classList.add("project");

    const title = document.createElement("h2");
    title.textContent = `Project: ${projectData.fname}`;

    const hours = document.createElement("p");
    hours.textContent = `Hours: ${projectData.lname} hrs this week`;

    const photo = document.createElement("img");
    photo.setAttribute("id", "projectPhoto");
    photo.src = projectData.photo;
    photo.style.width = "100%";

    card.append(title, hours, photo);
    card.dataset.name = projectData.fname;
    card.dataset.hours = projectData.lname;

    return card;
  }

  document.addEventListener("click", function (event) {
    let clickedElement = event.target;
    const card = event.target.closest(".project");
    if (!card) return;

    editingCard = card;
    document.getElementById("addProject").click();

    const name = card.dataset.name;
    const hours = card.dataset.hours;

    document.querySelector('#projectForm input[name="fname"]').value = name;
    document.querySelector('#projectForm input[name="lname"]').value = hours;
  });
});
