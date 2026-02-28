"use client";

import { Navbar } from "@components";
import { FullPageLoadingSpinner } from "@components/ui/loading/LoadingSpinner";
import ToggleButtonBar from "@components/ui/ToggleButtonBar";
import useCurrentUser from "@store/user";

const DataSaverTogglePage = () => {

    const { isHydrated, dataSaver, toggleDataSaver } = useCurrentUser();

    if (!isHydrated) return <FullPageLoadingSpinner path={["Data Saver"]} />

    return (
        <>
            <Navbar navTitle="Data Saver" className="border-b border-gray20" />
            <section className="px-2 sm:px-0">
                <ToggleButtonBar
                    checked={dataSaver}
                    label="Data Saver"
                    onClick={toggleDataSaver}
                    className="my-4 w-full"
                />

                <p className="mt-4 text-center">
                    Save Data while exploring Parlocula. Images and Videos wont be loaded automatically as well as Infinite Scrolling would be disabled. You manually need to load content.
                </p>
            </section>
        </>
    )

}

export default DataSaverTogglePage;