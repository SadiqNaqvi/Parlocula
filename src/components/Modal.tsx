"use client";

import { Fancybox } from "@fancyapps/ui";

type Props = {
    id: string;
    children: React.ReactNode;
};

type MoreArgs = React.ButtonHTMLAttributes<HTMLButtonElement>

export const Triggerer = ({ children, id, ...args }: Props & MoreArgs) => {
    return (
        <button
            data-modal
            data-src={`#${id}`}
            aria-haspopup="dialog"
            aria-controls={id}
            {...args}
        >
            {children}
        </button>
    );

}

export const CloseButton = ({ children, closeAll = false, onClick, ...args }: { children: React.ReactNode, closeAll?: boolean } & MoreArgs) => {
    const handleClick = (e: any) => {
        onClick?.(e)
        setTimeout(() => Fancybox.close(closeAll), 100);
    }

    return <button onClick={handleClick} {...args}>{children}</button>
}

export const Popover = ({ children, id }: Props) => {
    return <aside style={{ display: "none" }}>
        <div id={id} className="w-fit h-fit max-w-[98dvw] max-h-[98dvh] *:max-w-full *:max-h-full">
            {children}
        </div>
    </aside>
}

const Modal = ({ buttonChildren, children, id, ...args }: Props & { buttonChildren: React.ReactNode } & MoreArgs) => {
    return (
        <>
            <Triggerer {...args} id={id}>{buttonChildren}</Triggerer>
            <Popover id={id}>{children}</Popover>
        </>
    )
}

export default Modal;