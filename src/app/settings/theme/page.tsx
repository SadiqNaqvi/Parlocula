"use client";

import { CheckBoxIcon, EmptyBoxIcon } from "@assets/Icons";
import { Navbar } from "@components";
import { OptionalChildren } from "@components/ui";
import { useTheme } from "next-themes";

const AppThemePage = () => {
    const { setTheme, themes, theme } = useTheme();

    return (
        <>
            <Navbar navTitle="Themes" className="border-b border-gray20" />
            <section className="mt-4">
                <ul>
                    {themes.map(themeItem => (
                        <li key={themeItem} className="w-full">
                            <button className="w-full p-2 gap-2 flex flex-cntr-between" onClick={() => setTheme(themeItem)}>
                                <span className="capitalize">{themeItem}</span>
                                <span>
                                    <OptionalChildren condition={themeItem === theme} fallback={<EmptyBoxIcon />}>
                                        <CheckBoxIcon />
                                    </OptionalChildren>
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            </section>
        </>
    )


}

export default AppThemePage;