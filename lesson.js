var hljs; // Editor, stop screaming at me, I came from outside this world

async function loadLesson(lessonName) {
  const req = await fetch(`/${lessonName}.json`);
  if (req.status != 200) {
    location.href =
      "https://when-you-have-a-midterm-project-but-you-forget-to-start-on-time.glitch.me/lesson.html?lesson=404";
  }
  const lesson = await req.json();
  document.getElementById("lesson-name").innerText = lesson.title;
  document.title = "CyBooks - " + lesson.title;

  let lessonBody = document.getElementById("lesson-body");
  lessonBody.innerHTML = ""; // won't be observed until after function finishes, as we have no more awaits.

  let imageSideToggle = false;

  for (const card of lesson.cards) {
    let newCard = document.createElement("div");
    newCard.classList.add("card");
    let html = '<div class="card-body">';
    if (card.title) {
      html += `<h5 class="card-title">${card.title}</h5>`;
    }
    if (card.pre) {
      html += `<p class="card-text">${card.pre}</p>`;
    }
    if (card["mid-text"]) {
      if (card["mid-img"]) {
        html += `
      <div>
        <div class="img-container-${(imageSideToggle ^= true) ? "r" : "l"}">
          <img class="mid-card-img" src="${
            card["mid-img"]
          }" alt="image for card" width="100vh"></img>
        </div>
        <p class="card-text">${card["mid-text"]}</p>
      </div>`;
      } else {
        html += `
      <div>
        <p class="card-text">${card["mid-text"]}</p>
      </div>`;
      }
    }
    if (card.post) {
      html += `<hr>${card.post}`;
    }
    html += "</div>";
    newCard.innerHTML = html;
    lessonBody.appendChild(newCard);
  }

  Array.from(document.getElementsByTagName("code")).forEach((el) =>
    el.classList.add("language-javascript")
  );

  hljs.highlightAll();
}

let url = new URL(location.href);
let lessonName = url.searchParams.get("lesson");

loadLesson(lessonName);
