"use client";

import { Fancybox } from "@fancyapps/ui";
import { OptionsType } from "@fancyapps/ui/types/Fancybox/options";

type Props = {
    id: string;
    children: React.ReactNode;
};

type MoreArgs = React.ButtonHTMLAttributes<HTMLButtonElement>

export const CloseAndTrigger = ({ children, id, onClick, ...args }: Props & MoreArgs) => {

    const handleClick = (e: any) => {
        onClick?.(e)
        setTimeout(() => Fancybox.close(true), 50);
        setTimeout(() => Fancybox.show([{ src: `#${id}` }], { closeButton: false }), 50);
    }

    return (
        <button
            onClick={handleClick}
            {...args}
        >
            {children}
        </button>
    );

}

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

export const closeFancyBox = (all?: boolean) => {
    setTimeout(() => Fancybox.close(all), 100);
}

// export const showFancyBox = (src: string[], options?: Partial<OptionsType>) => {
//     Fancybox.show()
// }

export const CloseButton = ({ children, closeAll = false, onClick, ...args }: { children: React.ReactNode, closeAll?: boolean } & MoreArgs) => {
    const handleClick = (e: any) => {
        onClick?.(e)
        closeFancyBox(closeAll);
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