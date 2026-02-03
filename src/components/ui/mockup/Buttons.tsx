import { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

const MockupButton = ({ children, className, primary }: PropsWithChildren<{ className?: string, primary?: boolean }>) => (
    <div className={twMerge(`${primary ? "bg-zinc-500" : "border-2 border-zinc-500 "} rounded-md h-12 flex-1 sm:flex-none w-full max-w-screen-xs sm:w-28 text-center`, className)}></div>
)

export default MockupButton;