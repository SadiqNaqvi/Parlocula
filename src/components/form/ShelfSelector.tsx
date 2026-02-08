import { AddIcon, CheckIcon } from "@assets/Icons";
import { OptionalChildren, ShelfPoster } from "@components/ui";
import { AllShelves } from "@type/models";
import { twMerge } from "tailwind-merge";

export type ShelfSelectorProps = {
    _id: string,
    name: string,
    poster: string | undefined,
    shelf_type: AllShelves,
    disabled?: boolean,
    checked?: boolean,
    className?: string;
    onClick: (id: string) => void;
}

const ShelfSelector = ({ _id, name, poster, shelf_type, checked, disabled, className, onClick }: ShelfSelectorProps) => {

    return (
        <div
            className={twMerge(`inline-flex ${disabled ? "brightness-50" : ""} flex-cntr-between w-full capitalize px-4 py-2 pointer`, className)}
            onClick={() => onClick(_id)}
        >
            <div className="flex gap-2 items-center">
                <ShelfPoster iconsClassName="p-3" name={name} poster={poster} shelf_type={shelf_type} />

                <span className="font-medium">{name}</span>
            </div>
            <OptionalChildren condition={checked} fallback={<AddIcon />}>
                <CheckIcon />
            </OptionalChildren>
        </div>
    )
}

export default ShelfSelector;