import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import { Button } from "@headlessui/react";
import { useEffect } from "react";

// Then register the languages you need
hljs.registerLanguage("javascript", javascript);

export default function CodeEditor(props) {
  useEffect(() => {
    // document.getElementById("editBox-"+props.id.toString()).dispatchEvent(new Event("input"));
    document.getElementById("highlightBox-" + props.id).innerHTML =
      hljs.highlight(
        "javascript",
        document.getElementById("editBox-" + props.id).innerText
      ).value;
  });

  return (
    <div class="language-js">
      <pre>
        <code class="relative">
          <div id={"highlightBox-" + props.id} class="p-2 rounded highlightBox">
            {props.children}
          </div>
          <div
            id={"editBox-" + props.id}
            class="p-2 rounded editBox"
            contentEditable
            onInput={(e) => {
              document.getElementById("highlightBox-" + props.id).innerHTML =
                hljs.highlight("javascript", e.target.innerText).value || " ";
            }}
          >
            {props.children}
          </div>
        </code>
      </pre>
      <Button
        id={"runCode-" + props.id}
        class="bg-green-800 p-2 rounded font-semibold my-2"
        onClick={() => {
              // shhhhhhhhhhhh don't tell anybody
              // eslint-disable-next-line no-new-func
            var userCode = document.getElementById("editBox-" + props.id).innerText;
            var output = document.getElementById("consoleOutput-" + props.id);
          (function (console, doument, window, location, Function) {
            try {
                console.clear();
                eval(userCode);
            } catch (e) {
                alert(e);
            }
            // code
          })({
            log: (msg) => {output.innerText += msg.endsWith("\n")?msg:msg+"\n";},
            clear: () => {output.innerHTML = "";},
        }, null, null, null, null);
        }}
      >
        Run
      </Button>
      <code>
        <div id={"consoleOutput-" + props.id} class="bg-black p-2 rounded">
          Console output will appear here
        </div>
      </code>
    </div>
  );
}
