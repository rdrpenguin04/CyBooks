export default function EditText(props) {
  return (
    <div
      {...props}
      contentEditable={props.editable}
      class={
        (props.editable ? "bg-zinc-950 min-h-[50px] my-2 p-2 rounded " : "") +
        props.class
      }
    >
      {props.children}
    </div>
  );
}
