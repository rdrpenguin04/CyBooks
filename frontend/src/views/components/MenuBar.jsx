import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { useContext } from "react";
import { AccountInfoContext, ViewContext } from "../../Contexts";

const navigation = ["Dashboard", "Read"];

export default function MenuBar() {
    const {view, setView} = useContext(ViewContext);
    const {accountInfo} = useContext(AccountInfoContext);
    let loggedIn = accountInfo.accountType !== null;

    if( accountInfo.accountType === "instructor" )
        navigation[2] = "Edit";
    else if(accountInfo.accountType === null)
        delete navigation[2];

    return (
        <Disclosure as="nav" className="bg-red-950">
            {({ open }) => (
                <>
                    <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                        <div className="relative flex h-16 items-center justify-between">
                            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                                <DisclosureButton className="relative inline-flex items-center justify-center rounded-md p-2 text-zinc-400 hover:bg-zinc-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                                    <span className="absolute -inset-0.5" />
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <div className="block h-6 w-6" aria-hidden="true">
                                            X
                                        </div>
                                    ) : (
                                        <div className="block h-6 w-6" aria-hidden="true">
                                            ...
                                        </div>
                                    )}
                                </DisclosureButton>
                            </div>
                            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                                <div className="flex flex-shrink-0 items-center">
                                    <div className="h-8 w-auto">Logo</div>
                                </div>
                                <div className="hidden sm:ml-6 sm:block">
                                    <div className="flex space-x-4">
                                        {navigation.map((item) => (
                                            <button
                                                key={item}
                                                className={`${item === view[0]
                                                    ? "bg-zinc-900 text-white"
                                                    : "text-zinc-300 hover:bg-zinc-700 hover:text-white"
                                                    } rounded-md px-3 py-2 text-sm font-medium`}
                                                aria-hidden={item === view[0] ? "page" : undefined}
                                                onClick={() => setView([item, 'main'])}
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                                {loggedIn ? (
                                    <button
                                        type="button"
                                        className="relative rounded-md bg-red-900 p-1 m-1 text-yellow-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-800"
                                        onClick={() => setView([view[0], 'logout'])}
                                    >
                                        Log Out
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="relative rounded-md bg-red-900 p-1 m-1 text-yellow-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-800"
                                        onClick={() => setView([view[0], 'login'])}
                                    >
                                        Log In
                                    </button>
                                )}
                                {loggedIn ? (
                                    <>TODO</>
                                ) : (
                                    <button
                                        type="button"
                                        className="relative rounded-md bg-red-900 p-1 m-1 text-yellow-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-800"
                                        onClick={() => setView([view[0], 'signup'])}
                                    >
                                        Sign Up
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <DisclosurePanel className="sm:hidden">
                        <div className="space-y-1 px-2 pb-3 pt-2">
                            {navigation.map((item) => (
                                <DisclosureButton
                                    key={item}
                                    className={`${item === view[0]
                                        ? "bg-zinc-900 text-white"
                                        : "text-zinc-300 hover:bg-zinc-700 hover:text-white"
                                        } rounded-md px-3 py-2 text-base font-medium`}
                                    aria-current={item === view[0] ? "page" : undefined}
                                    onClick={() => setView([item, 'main'])}
                                >
                                    {item}
                                </DisclosureButton>
                            ))}
                        </div>
                    </DisclosurePanel>
                </>
            )}
        </Disclosure>
    );
}
