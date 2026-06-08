import { Monogram } from "@assets/Icons";
import { twMerge } from "tailwind-merge";

const ParloFooter = ({ className }: { className?: string; }) => (
    <footer className={twMerge("py-6 px-4", className)}>
        <div className="mb-4">
            <Monogram className="w-full h-auto text-gray-500 opacity-40 aspect-auto!" />
        </div>
        <p className="text-center ghostColor text-sm">All Rights Reserved | QCore Technologies 2021</p>
    </footer>
)

export default ParloFooter;