import { useContext, useState } from "react";
import { LessonIDContext, ViewContext } from "../../Contexts";
import { useEffect } from 'react';

export default function StudentDashboard() {
    const [myTodos, setMyTodos] = useState(null);
    const [myCompletions, setMyCompletions] = useState(null);
    const [allLessons, setAllLessons] = useState(null);
    const [unfinishedLessons, setUnfinishedLessons] = useState(null);
    const { setLessonID } = useContext(LessonIDContext);
    const { setView } = useContext(ViewContext);

    useEffect(() => {
        fetch('//localhost:8081/students/me/completions', { credentials: 'include' })
            .then(x => x.json())
            .then(async completions => {
                for (let completion of completions) {
                    let lesson = await fetch(`//localhost:8081/lessons/${completion.lesson}`)
                        .then(x => x.json());
                    completion.title = lesson.title;
                }
                setMyTodos(completions.filter((x) => x.progress < 1));
                setMyCompletions(completions.filter((x) => x.progress >= 1));
            });
    }, []);

    useEffect(() => {
        fetch('//localhost:8081/lessons', { credentials: 'include' })
            .then(x => x.json())
            .then(async lessons => setAllLessons(lessons));
    }, []);

    useEffect(() => {
        if (allLessons && myCompletions)
            setUnfinishedLessons(
                allLessons.filter(x => !myCompletions.find(y => y.lesson === x.id))
            );
    }, [allLessons, myCompletions])

    return <>
        <h1 className="text-4xl font-semibold">Welcome back!</h1>
        <hr className="my-2" />
        <h2 className="text-2xl font-semibold">Finish what you started:</h2>
        <div className="flex flex-row overflow-auto">
            {myTodos ? (
                myTodos.length > 0 ?
                    myTodos.map(completion => (
                        <div className="block border rounded-xl min-w-80 max-w-80 min-h-80 max-h-80 m-2 hover:cursor-pointer"
                            onClick={() => {
                                setLessonID(completion.lesson);
                                setView(['Read', 'main']);
                            }}
                        >
                            <div className="flex flex-col items-stretch h-full">
                                <h3 className="text-center text-lg font-semibold flex-1">
                                    {completion.title}
                                </h3>
                                <div>
                                    <p className="text-center">
                                        Progress: {(completion.progress * 100).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                                    </p>
                                    <div className="text-center">
                                        Todo: add completion bar
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) :
                    <p>You're all caught up! To find a new lesson to start, check the list below.</p>
            ) : <p>Loading...</p>}
        </div>
        <hr className="my-2" />
        <h2 className="text-2xl font-semibold">Try something new:</h2>
        <div className="flex flex-row overflow-auto">
            {unfinishedLessons ? (
                unfinishedLessons.lesson > 0 ?
                    unfinishedLessons.map(lesson =>
                        <div className="block border rounded-xl min-w-80 max-w-80 min-h-80 max-h-80 m-2 hover:cursor-pointer"
                            onClick={() => {
                                setLessonID(lesson.id);
                                setView(['Read', 'main']);
                            }}
                        >
                            <div className="flex flex-col items-stretch h-full">
                                <h3 className="text-center text-lg font-semibold flex-1">
                                    {lesson.title}
                                </h3>
                            </div>
                        </div>
                    ) : <div className="block">
                        <p>Congratulations; you've completed every CyBooks lesson! Now revel in your victory... or maybe create your own lesson?</p>
                        <p>CyBooks instructor accounts are free; try logging out and signing up for one!</p>
                    </div>
            ) : <p>Loading...</p>}
        </div>
        <hr className="my-2" />
        <h2 className="text-2xl font-semibold">See your accomplishments:</h2>
        <div className="flex flex-row overflow-auto">
            {myCompletions ? (
                myCompletions.length > 0 ?
                    myCompletions.map(completion => (
                        <div className="block border rounded-xl min-w-80 max-w-80 min-h-80 max-h-80 m-2 hover:cursor-pointer"
                            onClick={() => {
                                setLessonID(completion.lesson);
                                setView(['Read', 'main']);
                            }}
                        >
                            <div className="flex flex-col items-stretch h-full">
                                <h3 className="text-center text-lg font-semibold flex-1">
                                    {completion.title}
                                </h3>
                            </div>
                        </div>
                    )) :
                    <p>When you complete a lesson, it'll appear here!</p>
            ) : <p>Loading...</p>}
        </div>
    </>;
}