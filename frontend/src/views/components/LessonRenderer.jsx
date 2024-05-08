import lesson from '../pages/testlesson.json';
import Card from './Card';
import HTMLReactParser from 'html-react-parser/lib/index';

export default function LessonRenderer() {
    let imageSideToggle = false;

    // for (const card of lesson.cards) {
    //     let newCard = document.createElement("div");
    //     newCard.classList.add("card");
    //     let html = '<div class="card-body">';
    //     if (card.title) {
    //       html += `<h5 class="card-title">${card.title}</h5>`;
    //     }
    //     if (card.pre) {
    //       html += `<p class="card-text">${card.pre}</p>`;
    //     }
    //     if (card["mid-text"]) {
    //       if (card["mid-img"]) {
    //         html += `
    //       <div>
    //         <div class="img-container-${(imageSideToggle ^= true) ? "r" : "l"}">
    //           <img class="mid-card-img" src="${
    //             card["mid-img"]
    //           }" alt="image for card" width="100vh"></img>
    //         </div>
    //         <p class="card-text">${card["mid-text"]}</p>
    //       </div>`;
    //       } else {
    //         html += `
    //       <div>
    //         <p class="card-text">${card["mid-text"]}</p>
    //       </div>`;
    //       }
    //     }
    //     if (card.post) {
    //       html += `<hr>${card.post}`;
    //     }
    //     html += "</div>";
    //     newCard.innerHTML = html;
    //     lessonBody.appendChild(newCard);
    //   }

      return <>
        <h1 class="text-center text-4xl font-semibold">{lesson.title}</h1>
        {lesson.cards.map(card => <Card>
            {card.title && <h2 class="text-2xl font-semibold">{card.title}</h2>}
            {card.pre && <div>{card.pre}</div>}
            {card['mid-text'] && <div class="text-justify">{card['mid-img'] &&
                <img
                    class={`float-${imageSideToggle?"left":"right"} mid-card-img`} 
                    src={card['mid-img']}
                    alt=""/>}
                {HTMLReactParser(card['mid-text'])}
            {card.post && <div>{card.post}</div>}
            </div>}
        </Card>)}
      </>
}