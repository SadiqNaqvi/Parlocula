import React, { PropsWithChildren } from "react";
import BottomSheet from "./BottomSheet";
import { Drawer } from "vaul";

type ModalProps = PropsWithChildren<{
    button: React.ReactNode
}>

const Modal = ({ button, children }: ModalProps) => {
    return (
        <BottomSheet button={button}>
            {children}
        </BottomSheet>
    )
}

type WarningModalProps = {
    action: string,
    details?: string,
    dangerFunc: () => void,
    dangerButton: React.ReactNode
}

export const WarningModal = ({ action, dangerFunc, details, dangerButton }: WarningModalProps) => {
    return (
        <aside className="bg-primary w-full max-w-[500] p-4">
            <h4 className="text-lg text-center">
                Are you sure you want to {action}?
            </h4>
            {details ?
                <p className="mt-4 text-sm text-center text-zinc-500">{details}</p>
                :
                <p className="mt-4 text-sm text-center text-zinc-500">
                    This action cannot be undone.
                </p>
            }

            <div className=" flex flex-cntr-between">
                <Drawer.Close className="primary">Cancel</Drawer.Close>
                <button
                    className="secondary border-red-500"
                    onClick={dangerFunc}
                >{dangerButton}</button>
            </div>

        </aside>
    )
}

export default Modal;