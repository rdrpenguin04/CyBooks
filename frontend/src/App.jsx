import { useState } from 'react';
import MenuBar from './views/components/MenuBar';
import Login from './views/account/Login';
import { AccountInfoContext, LessonIDContext, ViewContext } from './Contexts';
import Logout from './views/account/Logout';
import Signup from './views/account/Signup';
import Dashboard from './views/pages/Dashboard';
import Editor from './views/pages/Editor';
import Reader from './views/pages/Reader';
import Footer from './views/components/Footer';

export default function App() {
    const [view, setView] = useState(['Dashboard', 'main']);
    const [accountInfo, setAccountInfo] = useState({ accountType: null });
    const [lessonID, setLessonID] = useState(null);
    return (
        <div className='bg-zinc-900 text-yellow-100 min-h-full'>
            <ViewContext.Provider value={{ view, setView }}>
                <AccountInfoContext.Provider value={{ accountInfo, setAccountInfo }}>
                    <LessonIDContext.Provider value={{ lessonID, setLessonID }}>
                        <MenuBar />
                        <div className='m-4'>
                            {view[1] === 'main' && (
                                <>
                                    {view[0] === 'Dashboard' && <Dashboard />}
                                    {view[0] === 'Edit' && <Editor />}
                                    {view[0] === 'Read' && <Reader />}
                                </>
                            )}
                            {view[1] === 'login' && <Login />}
                            {view[1] === 'logout' && <Logout />}
                            {view[1] === 'signup' && <Signup />}
                        </div>
                        <Footer />
                    </LessonIDContext.Provider>
                </AccountInfoContext.Provider>
            </ViewContext.Provider>
        </div>
    );
}
