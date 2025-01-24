import { LeftChevron } from "@assets/Icons";
import Navigate from "@components/Navigate";

export default function Page({ params }: { params: { id: string } }) {
    const { id } = params;
    return (
        <header className="flex items-center gap-4">
            <Navigate comp="button" goto="back" className="iconBtn">
                <LeftChevron />
            </Navigate>
            <h1 className="text-3xl uppercase font-semibold">{id}</h1>
        </header>
    )
}