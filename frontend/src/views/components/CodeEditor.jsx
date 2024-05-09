import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import { Button } from "@headlessui/react";
import { useEffect, useState } from "react";

// Then register the languages you need
hljs.registerLanguage("javascript", javascript);

export default function CodeEditor(props) {
    let [complete, setComplete] = useState(false);

    useEffect(() => {
        // document.getElementById("editBox-"+props.id.toString()).dispatchEvent(new Event("input"));
        document.getElementById("highlightBox-" + props.id).innerHTML =
            hljs.highlight(
                "javascript",
                document.getElementById("editBox-" + props.id).innerText
            ).value;
    });

    return (
        <div
            id={"interactive-" + props.id}
            className="language-js interactiveComponent relative"
        >
            <pre>
                <code>
                    <div
                        id={"highlightBox-" + props.id}
                        className="p-2 rounded highlightBox"
                    >
                        {props.children}
                    </div>
                    <div
                        id={"editBox-" + props.id}
                        className="p-2 rounded editBox"
                        contentEditable
                        onInput={(e) => {
                            document.getElementById(
                                "highlightBox-" + props.id
                            ).innerHTML =
                                hljs.highlight("javascript", e.target.innerText)
                                    .value || " ";
                        }}
                    >
                        {props.children}
                    </div>
                </code>
            </pre>
            <Button
                id={"runCode-" + props.id}
                className="bg-green-800 p-2 rounded font-semibold my-2 mr-2"
                onClick={() => {
                    setComplete(true);
                    var userCode = document.getElementById(
                        "editBox-" + props.id
                    ).innerText;
                    var output = document.getElementById(
                        "consoleOutput-" + props.id
                    );
                    (function (console, document, window, location, Function) {
                        try {
                            console.clear();
                            // shhhhhhhhhhhh don't tell anybody
                            // eslint-disable-next-line no-eval
                            var res = eval(userCode);
                            if (res)
                                output.innerHTML += `<span style="color: cyan;">Return value: </span>${
                                    typeof res === "object"
                                        ? JSON.stringify(res)
                                        : res
                                }`;
                        } catch (e) {
                            output.innerHTML = `<span style="color: red;">${e.toString()}</span>`;
                            setComplete(false);
                            // if(e.lineNumber !== undefined && e.columnNumber !== undefined) {
                            //     output.innerHTML += `<br /><span style="color: grey;">Caught at ${e.lineNumber}:${e.columnNumber}</span>`;
                            // }
                        }
                        // code
                    })(
                        {
                            log: (msg) => {
                                output.innerText += msg.endsWith("\n")
                                    ? msg
                                    : msg + "\n";
                            },
                            clear: () => {
                                output.innerHTML = "";
                            },
                        },
                        null,
                        null,
                        null,
                        null
                    );
                }}
            >
                Run
            </Button>
            <span className={"text-" + (complete ? "green" : "red") + "-500"}>
                {complete ? "Complete" : "Not complete"}
            </span>
            <code>
                <div
                    id={"consoleOutput-" + props.id}
                    className="bg-black p-2 rounded"
                >
                    <span className="text-zinc-500">
                        Console output will appear here
                    </span>
                </div>
            </code>
        </div>
    );
}
