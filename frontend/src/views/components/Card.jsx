export default function Card({children, id}) {
    return <div id={id} className="bg-zinc-800 shadow-lg my-4 p-2 rounded-md deal-the-cards">
        {children}
    </div>
}