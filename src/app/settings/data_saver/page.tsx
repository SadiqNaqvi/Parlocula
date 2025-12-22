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
            <Navbar navTitle="Data Saver" />

            <ToggleButtonBar
                checked={dataSaver}
                label="Data Saver"
                onClick={toggleDataSaver}
            />

            <p className="mt-4 text-center">
                Save Data while exploring Parlocula. Images and Videos wont be loaded automatically as well as Infinite Scrolling would be disabled. You manually need to load content.
            </p>
        </>
    )

}

export default DataSaverTogglePage;