import { useState } from 'react';
import MenuBar from './views/MenuBar';
import Login from './views/account/Login';
import { AccountInfoContext, ViewContext } from './Contexts';
import Logout from './views/account/Logout';
import Signup from './views/account/Signup';

export default function App() {
    const [view, setView] = useState(['Home', 'main']);
    const [accountInfo, setAccountInfo] = useState({ accountType: null });
    return (
        <div className='bg-red-900 text-yellow-100 h-full'>
            <ViewContext.Provider value={{ view, setView }}>
                <AccountInfoContext.Provider value={{ accountInfo, setAccountInfo }}>
                    <MenuBar />
                    <div className='m-4'>
                        {view[1] === 'main' && (
                            <>
                                {view[0] === 'Home' && 'Home'}
                                {view[0] === 'Away' && 'Away'}
                            </>
                        )}
                        {view[1] === 'login' && <Login />}
                        {view[1] === 'logout' && <Logout />}
                        {view[1] === 'signup' && <Signup />}
                    </div>
                </AccountInfoContext.Provider>
            </ViewContext.Provider>
        </div>
    );
}
