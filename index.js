(async () => {
  const req = await fetch(`/data.json`);
  if (req.status != 200) {
    // location.href = "https://when-you-have-a-midterm-project-but-you-forget-to-start-on-time.glitch.me/lesson.html?lesson=404";
  }
  const data = await req.json();
  // document.getElementById("lesson-name").innerHTML = lesson.title;

  let lessonBody = document.getElementById("lessonContainer");
  lessonBody.innerHTML = ""; // won't be observed until after function finishes, as we have no more awaits.

  let imageSideToggle = false;

  for (const card of data) {
    let newCard = document.createElement("div");
    newCard.classList.add("card");
    newCard.innerHTML = `
          <div class="card-body">
            <h5 class="card-title">
              ${card.title}
            </h5>
            <p class="card-text">
              ${card.description}
            </p>
            <a href="/lesson.html?lesson=${card.file}" class="btn">Try the course</a>
          </div>
    `;
    lessonBody.appendChild(newCard);
  }
})();
