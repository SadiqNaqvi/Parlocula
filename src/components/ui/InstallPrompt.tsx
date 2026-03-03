"use client";

import { useEffect, useRef, useState } from "react";
import OptionalChildren from "./OptionalChildren";

const InstallPrompt = () => {
    const [isIOS, setIsIOS] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false);
    const installPrompt = useRef<any>(null);

    useEffect(() => {
        setIsIOS(
            /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        )

        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

        const handleBeforeInstallPrompt = (event: any) => {
            console.log("entered hand;eBeforeInstallPrompt");
            console.log(event)
            // Prevent the default browser prompt
            event.preventDefault();


            // Store the event for later use
            installPrompt.current = event;
        };

        console.log("About to set beforeInstallPrompt on window");

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        }
    }, [])

    if (isStandalone) return null;

    const prompt = () => {

        console.log(installPrompt);
        const ev = installPrompt.current;


        if (ev && "prompt" in ev) ev.prompt();
    }

    return (
        <section className="my-4">
            <div className="flex flex-col flex-cntr-all py-4 mx-2 sm:mx-4 border border-gray30 rounded-md">
                <div className="space-y-1 mb-4">
                    <h3 className="text-center text-lg font-semibold">We don{"'"}t need the browser between us.</h3>
                    <p className="text-sm text-center">You can actually install Parlocula on your Home Screen.</p>
                </div>
                <OptionalChildren condition={isIOS} fallback={(
                    <button className="primary w-full sm:w-fit" onClick={prompt}>Install Parlocula</button>
                )}>
                    <p>To install Parlocula on your device, tap the options button, present either upper or bottom right side, and then "Add to Home Screen".</p>
                </OptionalChildren>
            </div>
        </section>
    )
}

export default InstallPrompt;