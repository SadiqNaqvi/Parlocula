"use client";
import { Suspense, useState } from "react";
import LoadingSpinner from "./ui/LoadingSpinner";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type TabProps = {
    Label: React.ReactNode,
    Component: JSX.Element,
    Loading?: React.ComponentType<any>,
}[]

const Tabs = ({ tabs }: { tabs: TabProps }) => {

    const [currentTab, setTab] = useState(0);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const ComponentToShow = () => {
        return tabs[currentTab].Component

    }

    const LoadingComponent = () => {
        const LoadingComp = tabs[currentTab].Loading ?? LoadingSpinner;
        return <LoadingComp />
    }

    const changeTab = (index: number) => {
        const params = new URLSearchParams(searchParams);
        if (params.has('p')) {
            params.delete("p");
            router.replace(`${pathname}?${params.toString()}`);
        }
        setTab(index);
    }

    return (
        <>
            <ul className="flex gap-4 noScroll overflow-x-auto">
                {tabs.map(({ Label }, ind) => (
                    <li className={`flex-1 border-b-2 capitalise ${currentTab === ind ? "border-secondary" : "border-gray40"}`} key={ind}>
                        <button className="w-full px-4 py-2 smallBtn" onClick={() => changeTab(ind)}>
                            {Label}
                        </button>
                    </li>
                ))}
            </ul>
            <div className="mt-4">
                <Suspense fallback={<LoadingComponent />}>
                    <ComponentToShow />
                </Suspense>
            </div>
        </>
    )
}

export default Tabs;