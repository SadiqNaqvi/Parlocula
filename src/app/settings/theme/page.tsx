"use client";

import { CheckBoxIcon, EmptyBoxIcon } from "@assets/Icons";
import { Navbar } from "@components";
import { useTheme } from "next-themes";

const AppThemePage = () => {
    const { setTheme, themes, theme } = useTheme();

    return (
        <>
            <Navbar navTitle="Themes" />
            <section className="mt-4">
                <ul>
                    {themes.map(themeItem => (
                        <li key={themeItem}>
                            <button className="p-2 gap-2 flex flex-cntr-between" onClick={() => setTheme(themeItem)}>
                                <span className="capitalize">{themeItem}</span>
                                <span>
                                    {themeItem === theme ?
                                        (
                                            <CheckBoxIcon />
                                        ) : (
                                            <EmptyBoxIcon />
                                        )}
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