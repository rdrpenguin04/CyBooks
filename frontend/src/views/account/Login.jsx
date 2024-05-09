import { Button, Field, Fieldset, Input, Label, Legend } from "@headlessui/react";
import { useContext, useState } from "react";
import { AccountInfoContext, ViewContext } from "../../Contexts";

export default function Login() {
    const [status, setStatus] = useState('');
    const { view, setView } = useContext(ViewContext);
    const { setAccountInfo } = useContext(AccountInfoContext);
    return (
        <>
            <form>
                <Fieldset
                    className='space-y-4 data-[disabled]:text-gray-200 transition-all duration-500'
                    disabled={(status === 'running' ? true : false)}
                >
                    <Legend className='text-4xl font-bold transition-all duration-500'>Log In</Legend>
                    <Field>
                        <Label className='block data-[disabled]:text-gray-200 transition-all duration-500'>Username</Label>
                        <Input className='mt-1 block bg-red-950 rounded disabled:text-gray-200 disabled:bg-rose-950 transition-all duration-500' name='username' />
                        {status === 'incorrect username' && (<p>Username is incorrect</p>)}
                    </Field>
                    <Field>
                        <Label className='block data-[disabled]:text-gray-200 transition-all duration-500'>Password</Label>
                        <Input type="password" className='mt-1 block bg-red-950 rounded disabled:text-gray-200 disabled:bg-rose-950 transition-all duration-500' name='password' />
                        {status === 'incorrect password' && (<p>Password is incorrect</p>)}
                    </Field>
                    <Button
                        className='rounded-xl bg-red-950 p-2 disabled:text-gray-200 disabled:bg-rose-950 transition-all duration-500'
                        onClick={async () => {
                            setStatus('running');
                            let formData = new FormData(document.querySelector('form'));
                            let username = formData.get('username');
                            let password = formData.get('password');
                            fetch('//localhost:8081/login', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    username: username,
                                    password: password,
                                }),
                                credentials: 'include',
                            })
                                .then(response => response.json())
                                .then(res => {
                                    if (res.error) {
                                        setStatus(res.error);
                                    } else {
                                        setAccountInfo({ username, accountType: res.accountType });
                                        setView([view[0], 'main']);
                                    }
                                })
                                .catch((error) => {
                                    console.log(`network error: ${error}`)
                                    setStatus('network error')
                                })
                        }}
                    >
                        {status === 'running' ? 'Logging in...' : 'Log in'}
                    </Button>
                </Fieldset>
            </form>
            {status === 'network error' && (<p>Network error; please try again</p>)}
            {status === 'missing username and/or password' && (<p>Please enter a username and password</p>)}
        </>
    );
}
