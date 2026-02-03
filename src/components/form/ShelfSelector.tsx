import { AddIcon, CheckIcon } from "@assets/Icons";
import ShelfPoster from "@components/ui/ShelfPoster";
import { AllShelves } from "@type/models";
import { useFormContext } from "react-hook-form";
import { twMerge } from "tailwind-merge";

export type ShelfSelectorProps = {
    _id: string,
    name: string,
    poster: string | undefined,
    shelf_type: AllShelves,
    disabled?: boolean,
    checked?: boolean,
    className?: string;
}

const ShelfSelector = ({ _id, name, poster, shelf_type, checked, disabled, className }: ShelfSelectorProps) => {
    const { register } = useFormContext();

    return (
        <label
            htmlFor={_id}
            className={twMerge(`inline-flex ${disabled ? "brightness-50" : ""} flex-cntr-between w-full capitalize px-4 py-2 pointer`, className)}>
            <input
                {...register(_id)}
                value={_id}
                type={"checkbox"}
                disabled={disabled}
                defaultChecked={checked}
                id={_id}
                className="sr-only peer"
            />
            <div className="flex gap-2 items-center">
                <ShelfPoster iconsClassName="p-3" name={name} poster={poster} shelf_type={shelf_type} />

                <span className="font-medium">{name}</span>
            </div>

            <CheckIcon className="hidden peer-checked:block" />
            <AddIcon className="block peer-checked:hidden" />
        </label>
    )
}

export default ShelfSelector;