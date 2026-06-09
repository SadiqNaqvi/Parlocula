import { AddIcon, CheckIcon } from "@assets/Icons";
import { OptionalChildren, ShelfPoster } from "@components/ui";
import { MereShelf } from "@type/internal";
import { twMerge } from "tailwind-merge";

export type ShelfSelectorProps = MereShelf & {
    disabled?: boolean,
    checked?: boolean,
    className?: string;
    onClick: (shelf: Pick<MereShelf, "_id" | "shelf_type">) => void;
}

const ShelfSelector = (props: ShelfSelectorProps) => {

    const { checked, onClick, disabled, className, ...shelf } = props;
    const { _id, name, poster, shelf_type } = shelf;

    return (
        <label
            htmlFor={_id}
            className={twMerge(`inline-flex ${disabled ? "brightness-50" : ""} flex-cntr-between w-full capitalize px-4 py-2 cursor-pointer`, className)}
            onClick={() => onClick({ _id, shelf_type })}
        >
            <input
                name={_id}
                value={_id}
                type="checkbox"
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