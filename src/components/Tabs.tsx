"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import LoadingSpinner from "./ui/LoadingSpinner";

type TabProps = {
    Label: React.ReactNode,
    Component: JSX.Element,
    Loading?: React.ComponentType<any>,
    tab_id: string,
}[]

const Tabs = ({ tabs }: { tabs: TabProps, }) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get("t");
    const tabIndex = tabs.findIndex(el => el.tab_id === currentTab);
    const selectedTab = tabIndex >= 0 ? tabIndex : 0

    const ComponentToShow = () => {
        return tabs[selectedTab].Component

    }

    const LoadingComponent = () => {
        const LoadingComp = tabs[selectedTab].Loading ?? LoadingSpinner;
        return <LoadingComp />
    }

    const changeTab = (tab: string) => {
        const params = new URLSearchParams(searchParams);
        params.delete("p");
        params.set("t", tab.trim());
        router.replace(`${pathname}?${params.toString()}`);
    }

    return (
        <>
            <ul className="flex py-3 gap-4 noScroll overflow-x-auto">
                {tabs.map(({ Label, tab_id }, ind) => (
                    <li className={`flex-1 border-b-2 capitalise ${selectedTab === ind ? "border-secondary" : "border-gray40 hover:border-gray-500"}`} key={ind}>
                        <button className="w-full px-4 py-2 smallBtn" onClick={() => changeTab(tab_id)}>
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