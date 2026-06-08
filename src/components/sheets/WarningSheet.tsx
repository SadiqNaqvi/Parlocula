import React from "react";
import { Drawer } from "vaul";
import { Button } from "../ui";

type WarningModalProps = {
    action: string,
    details?: string,
    dangerFunc: () => void,
    dangerButton: React.ReactNode
}

const WarningSheet = ({ action, dangerFunc, details, dangerButton }: WarningModalProps) => {
    return (
        <aside className="bg-primary w-full max-w-[500] p-4">
            <h4 className="text-lg text-center">
                Are you sure you want to {action}?
            </h4>
            <p className="mt-2 text-sm text-center ghostColor">
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

export default WarningSheet;