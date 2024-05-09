import backupLesson from '../pages/testlesson.json';
import Card from "./Card";
import EditText from "./EditText";
import CodeEditor from "./CodeEditor";

import HTMLReactParser, {
  attributesToProps,
} from "html-react-parser/lib/index";
import { Input, Label, Field, Button } from "@headlessui/react";
import { useState, useEffect, useContext } from "react";
import { LessonIDContext } from "../../Contexts";

import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";

function renderLessonToJSON() {
    return {
      title: document.getElementById("lesson-title").innerHTML,
      cards: [
        ...Array.from(
          document.getElementsByClassName("deal-the-cards")
        ).map((card, i) => {
            let index = card.id.slice(5);
          return {
            title:
              document.getElementById("card-" + index + "-title")
                .innerHTML ?? "",
            pre:
              document.getElementById("card-" + index + "-pre")
                ?.innerHTML ?? "",
            "mid-text":
              document.getElementById("card-" + index + "-mid-text")
                ?.innerHTML ?? "",
            "mid-img":
              document.getElementById("card-" + index + "-img")?.src ===
              // eslint-disable-next-line no-restricted-globals
              location.href
                ? ""
                : document.getElementById("card-" + index + "-img")
                    ?.src ?? "",
            post:
              document.getElementById("card-" + index + "-post")
                ?.innerHTML ?? "",
            interactive: document.getElementById(
              "card-" + index + "-interactive"
            )
              ? {
                  type: "code-editor",
                  lang: "js",
                  features: ["console"],
                  initial: document.getElementById(
                    "card-" + index + "-interactive"
                  )?.children[0].children[0].children[0].children[1]
                    .innerText,
                  expected: {
                    changed: true,
                    errors: false,
                  },
                }
              : null,
          };
        }),
      ],
    };
  }

// Then register the languages you need
hljs.registerLanguage("javascript", javascript);
export default function LessonRenderer({ editor, id }) {
  const [flags, setFlags] = useState([]);
  const [lesson, setLesson] = useState(backupLesson);
  const lessonID = useContext(LessonIDContext).lessonID ?? 'Zjzp1AcAdkh7rYgH'; // Temporary backup ID in case the context doesn't give me anything
  console.log("Lesson ID:", lessonID);

  useEffect(() => {
    (async () => {
        fetch("//localhost:8081/students/me/completions", {
          credentials: "include",
        })
          .then((x) => {if(x.status !== 200) console.error(x.json()); else return x.json();})
          .then(async (completions) => {
            console.log("Completions: ", completions);
            if(!completions) {

            } else {
            for (let completion of completions) {
              console.log(completion.lessonID);
              //   let lesson = await fetch(
              //     `//localhost:8081/lessons/${completion.lesson}`
              //   ).then((x) => x.json());
              //   completion.title = lesson.title;
            }
        }

        Array.from(
        document.getElementsByClassName("interactiveComponent")
      ).forEach((el, index) => {
        var f = [...flags];
        f.push(false);
        setFlags(f);
      });
      });

      console.log(lessonID);
      await fetch(`//localhost:8081/lessons/${lessonID}`).then((x) =>
        (x.json().then(j => {
            if(!j.error) {
                console.log(j);
                // setLesson(j);
            } else {
                console.error(j);
                console.error("Backup lesson used due to server error");
            }
        }))
      );
      console.log(lesson);
    })();
  }, [lesson]);

  if(lesson === null) return <div
  className="text-center text-4xl font-semibold"
  id="lesson-title">Loading...</div>

  let cardIndex = 0;
  let interactiveIndex = 0;

  return (
    <>
      <EditText
        editable={editor}
        className="text-center text-4xl font-semibold"
        id="lesson-title"
      >
        {lesson.title}
      </EditText>
      {lesson.cards.map((card, cardIndex) => {
        console.log(card.interactive);
        console.log(
          card.interactive && card.interactive.type === "code-editor"
        );
        return (
          <Card id={"card-"+cardIndex}>
            <EditText
              editable={editor}
              id={"card-" + cardIndex + "-title"}
              className="text-2xl font-semibold text-center mb-4"
            >
              {card.title}
            </EditText>
            <EditText editable={editor} id={"card-" + cardIndex + "-pre"}>
              {card.pre}
            </EditText>
            <hr className="h-px m-4  border-0 bg-zinc-700" />
            <div>
              {(card["mid-img"] || editor) && (
                <img
                  id={"card-" + cardIndex + "-img"}
                  className={`float-${
                    cardIndex % 2 ? "left" : "right"
                  } mid-card-img`}
                  src={card["mid-img"] ?? ""}
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
                      document.getElementById("card-" + cardIndex + "-img")?.src
                    }
                    onChange={(e) => {
                      let i = document.getElementById(
                        "card-" + cardIndex + "-img"
                      );
                      if (i)
                        i.src = e.target.value
                          ? e.target.value
                          : e.target.placeholder;
                    }}
                  />
                </Field>
              )}
              <EditText
                editable={editor}
                id={"card-" + cardIndex + "-mid-text"}
              >
                {HTMLReactParser(card["mid-text"] || "")}
              </EditText>
              {(card.post || editor) && (
                <hr className="h-px m-4  border-0 bg-zinc-700" />
              )}
              <EditText editable={editor} id={"card-" + cardIndex + "-post"}>
                {card.post}
              </EditText>
            </div>
            {card.interactive && card.interactive.type === "code-editor" && (
              <div id={"card-" + cardIndex + "-interactive"}>
                <CodeEditor id={interactiveIndex++}>
                  {card.interactive.initial}
                </CodeEditor>
              </div>
            )}
            {editor && (
                <Button
                id={"delete-card-"+cardIndex}
                onClick={(e) => {
                    var json = renderLessonToJSON();
                    if(!json.cards[+e.target.id.slice(12)].interactive){
                        json.cards[+e.target.id.slice(12)].interactive = {
                            type: "code-editor",
                            lang: "js",
                            features: ["console"],
                            initial: 'console.log("Hello!");',
                            expected: {
                              changed: true,
                              errors: false,
                            },
                        }
                    } else {
                        delete json.cards[+e.target.id.slice(12)].interactive;
                    }
                    json.cards = [...json.cards.flat()];
                    setLesson(json);
                }}
                className="bg-green-800 p-2 mt-2 mr-2 rounded font-semibold"
                >
                Toggle interactivity
                </Button>
            )}
            {editor && (
                <Button
                id={"delete-card-"+cardIndex}
                onClick={(e) => {
                    var json = renderLessonToJSON();
                    delete json.cards[+e.target.id.slice(12)];
                    json.cards = [...json.cards.flat()];
                    setLesson(json);
                }}
                className="bg-red-800 p-2 mt-2 mr-2 rounded font-semibold"
                >
                Delete this card
                </Button>
            )}
          </Card>
        );
      })}

      {editor && (
        <Button
          onClick={() => {
            var json = renderLessonToJSON();
            json.cards.push({})
            setLesson(json);
        }}
          className="bg-green-800 p-2 mt-2 mr-2 rounded font-semibold"
        >
          Add card
        </Button>
      )}

      {editor && (
        <Button
          onClick={() => {
            var json = renderLessonToJSON(lesson);
        
            console.log(json);
            console.log(JSON.stringify(json));
            // console.log(JSON.stringify(lesson));
            console.log(
              JSON.stringify(json) === JSON.stringify(lesson)
                ? "Saved correctly"
                : "Differences detected"
            );
        
            fetch("//localhost:8081/lessons", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(json),
              credentials: "include",
            })
              .then((response) => response.json())
              .then((res) => {
                if (res.error) {
                  console.error(res.error);
                } else {
                  console.log(res);
                }
              })
              .catch((error) => {
                console.log(`network error: ${error}`);
              });
        }}
          className="bg-green-800 p-2 mt-2 mr-2 rounded font-semibold"
        >
          Save
        </Button>
      )}
    </>
  );
}
