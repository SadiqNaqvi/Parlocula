import React, { PropsWithChildren } from "react";
import BottomSheet from "./BottomSheet";
import { Drawer } from "vaul";
import { Button } from "./ui";

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
            <p className="mt-2 text-sm text-center text-zinc-500">
                {details || "This action cannot be undone."}
            </p>

            <div className="flex gap-2 mt-4">
                <Button
                    id="modal-danger-button"
                    title={typeof dangerButton === "string" ? dangerButton : action}
                    className="h-10 px-4 rounded-md flex flex-cntr-all border-2 border-red-500 flex-1"
                    onClick={dangerFunc}
                >
                    {dangerButton}
                </Button>
                <Drawer.Close className="primary flex-1">
                    Cancel
                </Drawer.Close>
            </div>

        </aside>
    )
}

export default Modal;