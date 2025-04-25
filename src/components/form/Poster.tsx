"use client";

import { EditIcon } from "@assets/Icons";
import MediaInputCont from "@components/MediaInputCont";
import { Popover, Triggerer } from "@components/Modal";
import OptionMenu from "@components/OptionMenu";
import { InputFrame } from "@type/schemas";
import React, { useState } from "react";


const Poster = ({ removePicture, getImage, className }: { getImage: (args: any) => void, removePicture: () => void } & React.HTMLAttributes<HTMLDivElement>) => {

    const [poster, setPoster] = useState("");

    const togglePoster = (files?: InputFrame[]) => {
        if (files) {
            setPoster(files[0].url);
            getImage(files)
        }
        else {
            setPoster("");
            removePicture();
        }
    }

    return (
        <div className={`group ${className || "size-48 mx-auto"} relative`}>
            <div className="size-full absolute z-[1] rounded-full border border-dashed border-slate-500 group-has-[img]:backdrop-brightness-50 group-has-[img]:text-slate-50">
                {poster ?
                    <OptionMenu
                        id="update-poster"
                        ButtonElement={<EditIcon />}
                        className="size-full smallBtn flex flex-cntr-all"
                    >
                        <li className="w-full border-b border-gray30 hover:border-:(--gray40)">
                            <Triggerer id="poster-picker" className="w-full p-3 smallBtn text-left">
                                Change
                            </Triggerer>
                        </li>
                        <li className="w-full border-b border-gray30 hover:border-:(--gray40)">
                            <button className="w-full p-3 smallBtn text-left" onClick={() => togglePoster()}>
                                Remove
                            </button>
                        </li>
                    </OptionMenu>
                    :
                    <Triggerer id="poster-picker" className="smallBtn rounded-full flex flex-cntr-all size-full"><EditIcon /></Triggerer>
                }
            </div>
            {poster &&
                <img
                    src={poster}
                    alt=""
                    className="size-full rounded-full object-cover"
                />
            }
            <Popover id="poster-picker">
                <MediaInputCont type="image" callback={togglePoster} />
            </Popover>
        </div>
    )
}

export default Poster;