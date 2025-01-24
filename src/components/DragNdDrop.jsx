"use client";

import { useCustomReducer } from "@lib/hooks";
import { scaleImage } from "@lib/utils";
import { useState } from "react";

export default function Page() {

    const initialValue = {
        previewImg: "",
        scaledImg: "",
    }

    const [isDragEnter, setDragEnter] = useState(false);
    const { previewImg, scaledImg, setter } = useCustomReducer(initialValue);

    const preventDefault = (e) => {
        e.preventDefault();
        e.stopPropagation();
    }

    const handleDragEnter = (e) => {
        if (isDragEnter) return;
        setDragEnter(true);
        preventDefault(e)
    }

    const handleDragLeave = (e) => {
        if (!isDragEnter) return;
        setDragEnter(false);
        preventDefault(e);
    }

    const handleDrop = (e) => {
        preventDefault(e);
        setDragEnter(false);
        const files = e.dataTransfer.files;
        [...files].forEach(file => {
            readyFileForPreview(file);
        })
    };

    const readyFileForPreview = async (file) => {
        setter({ "scaledImg": await scaleImage(file) });
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setter({ "previewImg": reader.result });
        }
    }

    return (
        <>
            <header className="py-6">
                <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={preventDefault}
                    onDrop={handleDrop}
                    className={`h-80 relative aspect-video rounded-md border border-dashed ${isDragEnter ? "border-orange-500" : "border-gray-500"} flex flex-cntr-all flex-col gap-6`}>
                    <img src={`http://localhost:3000/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.dd92d993.png&w=64&q=75`} alt="" className="h-16" />
                    <p className="text-2xl">{isDragEnter ? "Oh yeah Daddy! Give it to me" : "Drop it here"}</p>
                </div>
            </header>
            <section className="w-full *:h-40 grid grid-cols-2">
                <div className="h-full">
                    {previewImg ?
                        <img src={previewImg} alt="lala" className="h-full w-full object-contain" />
                        :
                        <div className="size-full flex flex-cntr-all">Preview Image</div>
                    }
                </div>
                <div className="h-full">
                    {scaledImg ?
                        <img src={scaledImg} alt="lala" className="h-full w-full object-contain" />
                        :
                        <div className="size-full flex flex-cntr-all">Enhanced Image</div>
                    }
                </div>
            </section>
        </>
    )
}