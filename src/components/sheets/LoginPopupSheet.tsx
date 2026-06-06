import BottomSheet, { BottomSheetRef } from "@components/BottomSheet";
import Navigate from "@components/Navigate";

const title = "Oops! Looks like you are not a Parlo Member";
const desc = "You need to log-in to perform this action"

const LoginPopupSheet = ({ sheetRef, href, section }: { sheetRef: React.RefObject<BottomSheetRef>, href?: string, section?: string }) => (
    <BottomSheet title={title} description={desc} allowHandle ref={sheetRef}>
        <section className="p-4">
            <div className="my-4">
                <h4 className="parloHeading">{title}</h4>
                <p className="text-sm text-zinc-500 text-center">{desc}</p>
            </div>
            <Navigate
                comp="link"
                className="btn primary w-full" goto={`/join${href ? "?url=" + href : ''}`}
            >
                Log-In
            </Navigate>
            <div className="text-center text-sm text-zinc-500 space-y-2">
                <p>Do not worry since your {section || "content"} are saved locally. You need to log-in to post it globally.</p>
            </div>
        </section>
    </BottomSheet>
)

export default LoginPopupSheet;