import { Navigate, ShareButton, BottomSheet, BottomSheetRef } from "@components";
import { OptionList } from "@components/ui";
import { parloculaAppURL } from "@lib/constants";
import { toast } from "sonner";

const NavigationSheet = ({ sheetRef, href }: { sheetRef: React.RefObject<BottomSheetRef | null>, href: string }) => {
    const url = new URL(href, parloculaAppURL).href;

    const handleCopy = () => {
        if (navigator && "clipboard" in navigator) {
            navigator.clipboard.writeText(url)
                .then(() => toast.success("Content copied to clipboard"));
        } else {
            toast.error("Unable to copy text to clipboard");
        }
    }

    return (
        <BottomSheet allowHandle ref={sheetRef}>
            <section className="space-y-2 overflow-x-hidden">
                <div className="p-2 w-full text-sky-500 wrap-anywhere whitespace-break-spaces max-h-40 overflow-y-auto noScroll">{url}</div>
                <ul>
                    <OptionList>
                        <Navigate className="w-full" comp="button" goto={href}>
                            Visit
                        </Navigate>
                    </OptionList>
                    <OptionList onClick={handleCopy}>Copy Link</OptionList>
                    <OptionList>
                        <ShareButton textToShow="Share" title="Parlocula - The Cinematic Planet" url={url} className="w-full" />
                    </OptionList>
                </ul>
            </section>
        </BottomSheet>
    )
}

export default NavigationSheet;