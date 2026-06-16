import { Monogram } from "@assets/Icons";
import Navigate from "@components/Navigate";
import { twMerge } from "tailwind-merge";

const ParloFooter = ({ className }: { className?: string; }) => (
    <footer className={twMerge("py-6 px-4", className)}>
        <div className="mb-4">
            <Monogram className="w-full h-auto text-gray-500 opacity-40 aspect-auto!" />
        </div>
        <div>
            <p className="text-center ghostColor text-sm">All Rights Reserved | QCore Technologies {new Date().getFullYear()}</p>
            <div className="text-sm ghostColor space-x-2 mt-4 mx-auto w-fit">
                <Navigate comp="link" className="inline underline" goto="/app/about">About Parlocula</Navigate>
                <span>|</span>
                <Navigate comp="link" className="inline underline" goto="/app/terms_and_conditions">Terms and Conditions</Navigate>
                <span>|</span>
                <Navigate comp="link" className="inline underline" goto="/app/privacy_policy">Privacy Policy</Navigate>
            </div>
        </div>
    </footer>
)

export default ParloFooter;