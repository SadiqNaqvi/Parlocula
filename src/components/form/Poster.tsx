"use client";

import { EditIcon } from "@assets/Icons";
import { CloseButton, Popover, Triggerer } from "@components/FancyboxModal";
import OptionMenu from "@components/OptionMenu";
import { useCustomReducer } from "@lib/hooks";
import { InputManagerType } from "@type/other";
import { InputFrame } from "@type/schemas";
import Image from "next/image";
import { forwardRef, useImperativeHandle } from "react";
import { MediaInputPrompt } from "./MediaInputCont";

type Props = {
    defaultPoster?: string,
    className?: string
    size?: `size-${number}`
};

const Poster = forwardRef<InputManagerType<InputFrame | null>, Props>(
    ({ className, defaultPoster, size }: Props, ref) => {

        const { poster, frame, setter } = useCustomReducer({
            poster: defaultPoster ?? "",
            frame: (defaultPoster ? {
                blob: null,
                isExternal: true,
                path: defaultPoster,
                shouldUpload: false,
                type: "image"
            } : null) as InputFrame | null,
        });

        useImperativeHandle(ref, () => ({
            getData: () => frame,
        }));

        const togglePoster = (file?: InputFrame) => {
            if (file) {
                setter({ frame: file, poster: file.path });
            }
            else {
                setter({ frame: null, poster: "" });
            }
        }

        return (
            <div className={`group ${className || "mx-auto"} ${size || "size-48"} relative`}>
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
                                <CloseButton className="w-full p-3 smallBtn text-left" onClick={() => togglePoster()}>
                                    Remove
                                </CloseButton>
                            </li>
                        </OptionMenu>
                        :
                        <Triggerer id="poster-picker" className="smallBtn rounded-full flex flex-cntr-all size-full">
                            <EditIcon />
                        </Triggerer>
                    }
                </div>
                {poster &&
                    <Image
                        width={192}
                        height={192}
                        src={poster}
                        priority
                        alt="Poster"
                        className="size-full rounded-full object-cover"
                    />
                }
                <Popover id="poster-picker">
                    <MediaInputPrompt type="image" callback={togglePoster} />
                </Popover>
            </div>
        )
    })

export default Poster;