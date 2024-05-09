import { useContext } from "react";
import { ViewContext } from "../../Contexts";

export default function About() {
    let { view, setView } = useContext(ViewContext);
    return <>
        <h1 className="text-4xl font-semibold mb-4 text-center">CyBooks</h1>
        <p className="text-center max-w-lg m-auto mb-4">
            CyBooks is a versatile learning platform specifically designed to make programming lessons more accessible to people while also allowing the creation of lessons to be simpler. The concept is based on a similarly-named product we used in class, but we decided that a version built for Cyclones would be better suited for our needs, hence the new platform.
        </p>
        <p className="text-center mx-12">
            <button className="text-yellow-300 underline" onClick={() => setView([view[0], 'signup'])}>Sign up</button> to try it out yourself, or <button className="text-yellow-300 underline" onClick={() => setView([view[0], 'login'])}>log in</button> if you have an existing account!
        </p>
    </>;
}