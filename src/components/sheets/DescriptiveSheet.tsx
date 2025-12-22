import BottomSheet from "@components/BottomSheet";
import { PropsWithChildren } from "react";

type Props = {
    title?: string,
    descriptions: string[],
    className?: string,
}

const DescriptiveSheet = ({ children, title, descriptions, className }: PropsWithChildren<Props>) => {

    return (
        <BottomSheet button={children} className={className}>
            <div className="py-4">
                {title && <h4 className="text-xl capitalize">{title}</h4>}
                <ul className="space-y-2">
                    {descriptions.map(desc => (
                        <li key={desc} className="text-sm">
                            {desc}
                        </li>
                    ))}
                </ul>
            </div>
        </BottomSheet>
    )

}

export default DescriptiveSheet;