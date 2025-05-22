"use client";

const OptionList = ({ onClick, children, className = "" }: { onClick?: (...arg: any) => any, children: React.ReactNode, className?: string }) => {
    return (
        <li className={`${className} border-b border-gray30 w-full`}>
            <button
                onClick={onClick}
                className="py-2 px-4 capitalize hover:bg-zinc-500 hover:bg-opacity-20 transition-colors flex flex-cntr-between w-full">
                {children}
            </button>
        </li>
    )
}

export default OptionList;