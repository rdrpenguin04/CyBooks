import lesson from "../pages/testlesson.json";
import Card from "./Card";
import EditText from "./EditText";
import HTMLReactParser, {
  attributesToProps,
} from "html-react-parser/lib/index";
import { Input, Label, Field, Button } from "@headlessui/react";

export default function LessonRenderer({ editor }) {
  let cardIndex = 0;

  return (
    <>
      <EditText editable={editor} class="text-center text-4xl font-semibold" id="lesson-title">{lesson.title}</EditText>
      {lesson.cards.map((card, cardIndex) => {
        return (
          <Card>
              <EditText editable={editor}
                id={"card-" + cardIndex + "-title"}
                class="text-2xl font-semibold text-center mb-4"
              >
                {card.title}
              </EditText>
              <EditText editable={editor} id={"card-" + cardIndex + "-pre"}>{card.pre}</EditText>
              <hr class="h-px m-4  border-0 bg-zinc-700" />
            <div>
              {card["mid-img"] && (
                <img
                  id={"card-" + cardIndex + "-img"}
                  class={`float-${
                    cardIndex % 2 ? "left" : "right"
                  } mid-card-img`}
                  src={card["mid-img"]}
                  alt={card["mid-img-alt"] ? card["mid-img-alt"] : ""}
                />
              )}
              {editor && (
                <Field>
                  <Label className="">Replace image URL</Label>
                  <Input
                    id={"card-" + cardIndex + "-img-replace"}
                    type="text"
                    className="mt-1 block bg-zinc-950 rounded"
                    name="password"
                    placeholder={
                      document.getElementById("card-" + cardIndex + "-img").src
                    }
                    onChange={(e) => {
                      document.getElementById(
                        "card-" + cardIndex + "-img"
                      ).src = e.target.value
                        ? e.target.value
                        : e.target.placeholder;
                    }}
                  />
                </Field>
              )}
              <EditText editable={editor} id={"card-" + cardIndex + "-mid-text"}>{HTMLReactParser(card["mid-text"] || "")}</EditText>
              {card.post && <hr class="h-px m-4  border-0 bg-zinc-700" />}
              <EditText editable={editor} id={"card-" + cardIndex + "-post"}>{card.post}</EditText>
            </div>
          </Card>
        );
      })}

      {editor && <Button onClick={() => {
        let json = {
            title: document.getElementById("lesson-title").innerHTML,
            cards: [
                ...Array.from(document.getElementsByClassName("deal-the-cards")).map((card, index) => {return {
                    title: document.getElementById("card-" + index + "-title").innerHTML ?? "",
                    pre: document.getElementById("card-" + index + "-pre")?.innerHTML ?? "",
                    "mid-text": document.getElementById("card-" + index + "-mid-text")?.innerHTML ?? "",
                    "mid-img": document.getElementById("card-" + index + "-img")?.src ?? "",
                    post: document.getElementById("card-" + index + "-post")?.innerHTML ?? "",
                }})
            ]
        };
        console.log(json);
        // console.log(JSON.stringify(json));
        // console.log(JSON.stringify(lesson));
        console.log(JSON.stringify(json) === JSON.stringify(lesson)?"Saved correctly":"Differences detected");

        fetch('//localhost:8081/lessons', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(json),
            credentials: 'include',
        })
            .then(response => response.json())
            .then(res => {
                if (res.error) {
                    console.error(res.error);
                } else {
                    console.log(res);
                }
            })
            .catch((error) => {
                console.log(`network error: ${error}`)
            })

    }}
      class="bg-green-800 p-2 rounded font-semibold">Save</Button>}
    </>
  );
}
