"use client";

import { CheckBoxIcon, EmptyBoxIcon, MoonIcon, RainbowIcon, SunIcon } from "@assets/Icons";
import { Navbar } from "@components";
import { Button, OptionalChildren } from "@components/ui";
import { useTheme } from "next-themes";

const CorrectIcon = ({ theme }: { theme: string }) => {

    if (theme === "dark") return <MoonIcon />
    else if (theme === "light") return <SunIcon />
    else return <RainbowIcon />
}

const AppThemePage = () => {
    const { setTheme, themes, theme } = useTheme();

    return (
        <>
            <Navbar navTitle="Themes" className="border-b border-gray20" />
            <section className="mt-4">
                <ul>
                    {themes.map(themeItem => (
                        <li key={themeItem} className="w-full">
                            <Button
                                id={`${themeItem}-theme-button`}
                                title={themeItem}
                                className="w-full p-2 gap-2 flex flex-cntr-between"
                                onClick={() => setTheme(themeItem)}
                            >
                                <div className="flex gap-2 items-center">
                                    <CorrectIcon theme={themeItem} />
                                    <span className="capitalize">{themeItem}</span>
                                </div>
                                <span>
                                    <OptionalChildren condition={themeItem === theme} fallback={<EmptyBoxIcon />}>
                                        <CheckBoxIcon />
                                    </OptionalChildren>
                                </span>
                            </Button>
                        </li>
                    ))}
                </ul>
            </section>
        </>
    )


}

export default AppThemePage;