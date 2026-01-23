import { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

export const PrimaryButton = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
    <div className={twMerge("bg-secondary color-primary rounded-md py-2 px-4 text-center", className)}>{children}</div>
)

export const SecondaryButton = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
    <div className={twMerge("border-2 border-secondary rounded-md py-2 px-4 text-center", className)}>{children}</div>
)