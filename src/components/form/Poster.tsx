"use client";

import { EditIcon } from "@assets/Icons";
import BottomSheet, { BottomSheetRef, NestedSheet } from "@components/BottomSheet";
import { CloseButton, Triggerer } from "@components/FancyboxModal";
import OptionMenu from "@components/OptionMenu";
import { useCustomReducer } from "@lib/hooks";
import { InputManagerType } from "@type/other";
import { InputFrame } from "@type/schemas";
import Image from "next/image";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { MediaInputPrompt } from "./MediaPicker";

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

        const sheetRef = useRef<BottomSheetRef>(null);

        useImperativeHandle(ref, () => ({
            getData: () => frame,
        }));

        const addPoster = (file: InputFrame) => {
            setter({ frame: file, poster: file.path });
            sheetRef.current?.close();
        }

        const removePoster = () => {
            setter({ frame: null, poster: "" });

            sheetRef.current?.close();
        }

        if (!poster) return (
            <div className={`group ${className || "mx-auto"} ${size || "size-48"} relative`}>
                <BottomSheet button={<EditIcon />} className="smallBtn rounded-full flex flex-cntr-all size-full">
                    <MediaInputPrompt type="image" callback={addPoster} />
                </BottomSheet>
            </div>
        )

        return (
            <div className={`group ${className || "mx-auto"} ${size || "size-48"} relative`}>
                <div className="size-full absolute z-[1] rounded-full border border-dashed border-slate-500 group-has-[img]:backdrop-brightness-50 group-has-[img]:text-slate-50">
                    <OptionMenu
                        id="update-poster"
                        sheetRef={sheetRef}
                        ButtonElement={<EditIcon />}
                        className="size-full smallBtn flex flex-cntr-all"
                    >
                        <li className="w-full border-b border-gray30 hover:border-(--gray40) text-[gray]">
                            <NestedSheet button="Change" className="w-full p-3 smallBtn text-left">
                                <MediaInputPrompt type="image" callback={addPoster} />
                            </NestedSheet>
                        </li>
                        <li className="w-full border-b border-gray30 hover:border-:(--gray40)">
                            <button onClick={removePoster}>
                                Remove
                            </button>
                        </li>
                    </OptionMenu>
                </div>

                <Image
                    width={192}
                    height={192}
                    src={poster}
                    priority
                    alt="Poster"
                    className="size-full rounded-full object-cover"
                />
            </div>
        )
    });

Poster.displayName = "Poster";

export default Poster;