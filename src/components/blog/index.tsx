import { PropsWithChildren } from "react"

export const BlogSection = ({ children, id, className }: PropsWithChildren<{ className?: string, id?: string }>) => (
    <section id={id} className={`${className} my-6 py-6 border-t border-zinc-500`}>
        {children}
    </section>
)

export const BlogSubSection = ({ children, id, className }: PropsWithChildren<{ className?: string, id?: string }>) => (
    <div id={id} className={`${className} my-4 space-y-2" id={id`}>
        {children}
    </div>
)

export const BlogHeading1 = ({ children, id, className }: PropsWithChildren<{ className?: string, id?: string }>) => (
    <h1 id={id} className={`${className} text-3xl font-semibold`}>
        {children}
    </h1>
)

export const BlogHeading2 = ({ children, id, className }: PropsWithChildren<{ className?: string, id?: string }>) => (
    <h2 id={id} className={`${className} text-2xl font-semibold`}>
        {children}
    </h2>
)

export const BlogHeading3 = ({ children, id, className }: PropsWithChildren<{ className?: string, id?: string }>) => (
    <h1 id={id} className={`${className} text-lg font-semibold`}>
        {children}
    </h1>
)

export const BlogList = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
    <li className={`${className} my-2`}>
        {children}
    </li>
)

export const BlogFooter = ({ className }: { className?: string }) => (
    <footer className={`${className} w-full bg-primary py-8`}>
        <h2 className="text-[12vw] whitespace-nowrap opacity-10 my-4">PARLOCULA</h2>
    </footer>
)