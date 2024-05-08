import { useContext } from "react";
import { AccountInfoContext, ViewContext } from "../../Contexts";

export default function Logout() {
    const { view, setView } = useContext(ViewContext);
    const { setAccountInfo } = useContext(AccountInfoContext);

    fetch(
        '//localhost:8081/logout',
        {
            method: 'POST',
            credentials: 'include',
        }
    ).then(() => {
        setAccountInfo({ accountType: null });
        setView([view[0], 'main']);
    });

    return (
        <p>Logging out...</p>
    );
}