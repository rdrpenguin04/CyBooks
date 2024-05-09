import { useContext, useState } from "react";
import { LessonIDContext, ViewContext } from "../../Contexts";

export default function StudentDashboard() {
    const [myCompletions, setMyCompletions] = useState(null);
    const { setLessonID } = useContext(LessonIDContext);
    const { setView } = useContext(ViewContext);

    fetch('//localhost:8081/students/me/completions', { credentials: 'include' })
        .then(x => x.json())
        .then(async completions => {
            for (let completion of completions) {
                let lesson = await fetch(`//localhost:8081/lessons/${completion.lesson}`)
                    .then(x => x.json());
                completion.title = lesson.title;
            }
            setMyCompletions(completions);
        });

    return myCompletions ? (<>
        <h1 className="text-4xl font-semibold">Welcome back!</h1>
        <hr className="my-2" />
        <h2 className="text-2xl font-semibold">Finish what you started:</h2>
        <div className="flex flex-row overflow-scroll">
            {
                myCompletions.map(completion => (
                    <div className="block border rounded-xl min-w-80 max-w-80 min-h-80 max-h-80 m-2 hover:cursor-pointer" onClick={() => {
                        setLessonID(completion.lesson);
                        setView(['Read', 'main']);
                    }}>
                        <div className="flex flex-col items-stretch h-full">
                            <h3 className="text-center text-lg font-semibold flex-1">{completion.title}</h3>
                            <div>
                                <p className="text-center">
                                    Progress: {(completion.progress * 100).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                                </p>
                                <div className="flex">
                                    Matthew please add bar
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            }
        </div>
    </>) : <p>Loading...</p>;
}