"use client";

import BottomSheet from "@components/BottomSheet";
import { useEffect, useState } from "react";

const InstallPrompt = () => {
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    }, []);

    if (isStandalone) return null;

    return (
        <section className="my-4 px-2">
            <div className="flex flex-col flex-cntr-all">
                <div className="space-y-1 mb-4">
                    <h3 className="text-center text-lg font-semibold">We don{"'"}t need the browser between us.</h3>
                    <p className="text-sm text-center">You can actually install Parlocula on your Home Screen.</p>
                    <BottomSheet
                        title="Install Parlocula"
                        description="To install Parlocula on your device"
                        button="View"
                        className="primary w-full sm:w-80 mx-auto mt-4"
                    >
                        <ol className="list-decimal list-inside px-2 space-y-1">
                            <li>Click on the options ( ⋮ ) button</li>
                            <li>Click on "Install App" or "Add to Home Screen"</li>
                            <li>If you cant find it, click on share {">"} View More {">"} Add To Home Screen</li>
                        </ol>
                    </BottomSheet>
                </div>
            </div>
        </section>
    )
}

export default InstallPrompt;