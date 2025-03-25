import { EditIcon } from "@assets/Icons";
import OptionMenu from "@components/OptionMenu";

const Poster = ({ picture, removePicture, className }: { picture: string, removePicture: () => void } & React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div className={`group ${className || "size-48 mx-auto"} relative`}>
            <div className="size-full absolute z-[1] rounded-full border border-dashed border-slate-500 group-has-[img]:backdrop-brightness-50 group-has-[img]:text-slate-50">
                {picture ?
                    <OptionMenu
                        ButtonElement={<EditIcon />}
                        className="size-full smallBtn flex flex-cntr-all"
                        controls="auto">
                        <li className="w-full border-b border-gray30 hover:border-:(--gray40)">
                            <button className="w-full p-3 smallBtn text-left" popoverTarget="profile-picker">
                                Change
                            </button>
                        </li>
                        <li className="w-full border-b border-gray30 hover:border-:(--gray40)">
                            <button className="w-full p-3 smallBtn text-left" onClick={removePicture}>
                                Remove
                            </button>
                        </li>
                    </OptionMenu>
                    :
                    <button
                        popoverTarget="poster-picker"
                        className="smallBtn rounded-full flex flex-cntr-all size-full">
                        <EditIcon />
                    </button>
                }
            </div>
            {picture &&
                <img
                    src={picture}
                    alt=""
                    className="size-full rounded-full object-cover"
                />
            }
        </div>
    )
}

export default Poster;