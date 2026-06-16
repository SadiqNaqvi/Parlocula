import { PropsWithChildren } from "react"
import { twMerge } from "tailwind-merge"

export const BlogSection = ({ children, id, className }: PropsWithChildren<{ className?: string, id?: string }>) => (
    <section id={id} className={twMerge("my-4 p-4 rounded-md bg-gray10 border border-gray10", className)}>
        {children}
    </section>
)

export const BlogSubSection = ({ children, id, className }: PropsWithChildren<{ className?: string, id?: string }>) => (
    <div id={id} className={twMerge("my-4 space-y-4", className)}>
        {children}
    </div>
)

export const BlogHeading1 = ({ children, id, className }: PropsWithChildren<{ className?: string, id?: string }>) => (
    <h1 id={id} className={twMerge("text-2xl font-semibold", className)}>
        {children}
    </h1>
)

export const BlogHeading2 = ({ children, id, className }: PropsWithChildren<{ className?: string, id?: string }>) => (
    <h2 id={id} className={twMerge("text-xl font-semibold", className)}>
        {children}
    </h2>
)

export const BlogHeading3 = ({ children, id, className }: PropsWithChildren<{ className?: string, id?: string }>) => (
    <h1 id={id} className={twMerge("font-semibold", className)}>
        {children}
    </h1>
)

export const BlogList = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
    <li className={twMerge("my-2 list-disc list-outside ml-5", className)}>
        {children}
    </li>
)