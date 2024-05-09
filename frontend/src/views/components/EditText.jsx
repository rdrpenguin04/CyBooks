export default function EditText(props) {
    return (
        <div
            {...props}
            contentEditable={props.editable}
            className={
                (props.editable
                    ? "bg-zinc-950 min-h-[30px] my-2 p-2 rounded "
                    : "") + props.className
            }
        >
            {props.children}
        </div>
    );
}
