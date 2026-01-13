import { oneKb, oneMb } from "@lib/constants";

type FileAcceptTypes = Blob | File | string;

export const scaleImage = async (file: File): Promise<Blob | null> => {
    if (!file) return null;
    const reader = new FileReader();
    reader.readAsDataURL(file);

    try {
        const blob = await new Promise<Blob | null>(
            (resolve, reject) =>
            (reader.onloadend = () => {
                const image = new Image();
                image.src = reader.result as string;
                image.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = image.naturalWidth;
                    canvas.height = image.naturalHeight;
                    const context = canvas.getContext("2d");
                    if (!context) {
                        reject("no context");
                        return null;
                    }
                    context.drawImage(image, 0, 0);
                    canvas.toBlob((blob) => {
                        if (!blob) reject("No blob found");
                        else resolve(blob);
                    }, `image/webp`);
                };
            })
        );
        return blob;
    } catch (err: any) {
        console.log("Failed scaling image" + err);
        return null;
    }
};

const getPath = (obj: FileAcceptTypes): string => {
    if (typeof obj === "string") return obj;

    else return URL.createObjectURL(obj);
}

export const showSize = (size: number): string => {
    let newSize = size;
    let unit = "B";

    if (size > oneMb) {
        newSize = size / oneMb;
        unit = "MB"
    } else if (size > oneKb) {
        newSize = size / oneKb;
        unit = "KB"
    }

    const [int, frac] = newSize.toString().split(".");
    return [int].concat([frac.slice(0, 2)]).join('.').concat(` ${unit}`)
}

export const generateSnapshot = async (file: FileAcceptTypes, timeInSeconds = 0.01) => {
    const path = getPath(file);

    return new Promise<string>((res, rej) => {
        const video = document.createElement("video");
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;

        if (!context) rej("Context not found")

        video.setAttribute("crossorigin", "anonymous");
        video.preload = "metadata";

        video.addEventListener("loadeddata", () => {
            video.currentTime = timeInSeconds;
        });

        video.addEventListener("seeked", () => {

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                if (!blob) rej("Blob not found while generating snapshot");
                res(URL.createObjectURL(blob!))
            })
        });

        video.addEventListener("error", () => rej("Unable to load this video!"));

        video.src = path;
        video.load();
    });
}

/**
* A function that converts blob | file to image element.
*
* @param blob Blob | File to load image
* @returns HTMLImageElement
*/

const loadImage = (file: FileAcceptTypes): Promise<HTMLImageElement> => {
    const path = getPath(file);
    return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            URL.revokeObjectURL(img.src);
            resolve(img);
        }
    });
}

/**
* A function to create thumbnail hash.
* A thumbnail hash is a 20-30 character long string which represents the image in a low-res blurry way.
* Thumbnail has can be used as a placeholder while the image is loading.
* 
* @param file: Blob | File to create image hash
* @returns string
*/

export const createThumbHash = async (file: FileAcceptTypes) => {

    // 1. Load the image
    const img = await loadImage(file);

    // 2. Draw to a very small canvas
    const size = 6; // 6x6 gives 36 pixels
    const aspect = img.width / img.height;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(img, 0, 0, size, size);

    // 3. Get RGBA data
    const { data } = ctx.getImageData(0, 0, size, size);

    // 4. Quantize and pack color info
    let totalBrightness = 0;
    const rgbValues: number[] = [];
    for (let i = 0; i < data.length; i += 4) {
        const r = Math.round(data[i] / 36); // 0–7 (3 bits)
        const g = Math.round(data[i + 1] / 36); // 0–7 (3 bits)
        const b = Math.round(data[i + 2] / 85); // 0–3 (2 bits)
        const brightness = (r + g + b) / 3;
        totalBrightness += brightness;

        rgbValues.push((r << 5) | (g << 2) | b); // 3 + 3 + 2 = 8 bits
        // rgbValues.push((r << 6) | (g << 3) | b); // pack into 1 byte (3+3+2 bits approx)
    }

    // 5. Convert to binary string
    const avgBrightness = Math.round(totalBrightness / (data.length / 4));
    const aspectByte = Math.min(255, Math.round(aspect * 16));
    const packedHeader = String.fromCharCode(avgBrightness, aspectByte);
    const binary = packedHeader + String.fromCharCode(...rgbValues);

    return btoa(binary);
}

/**
* A function that converts the thumb hash into temporary image url
* 
* @param hash Base64 string
* @returns string
*/

export const decodeHash = (base64: string): Promise<string> => {
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

    const avgBrightness = bytes[0];     // first byte: brightness
    const width = bytes[1];             // second: width
    const height = bytes[2];            // third: height
    const pixelData = bytes.slice(3);   // rest: pixel info

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    const imgData = ctx.createImageData(width, height);

    const brightnessFactor = avgBrightness / 128;
    for (let i = 0; i < pixelData.length; i += 3) {
        const r = pixelData[i];
        const g = pixelData[i + 1];
        const b = pixelData[i + 2];

        // Apply brightness correction (normalize around 128 mid-point)
        imgData.data[i * (4 / 3) + 0] = Math.min(255, r * brightnessFactor);
        imgData.data[i * (4 / 3) + 1] = Math.min(255, g * brightnessFactor);
        imgData.data[i * (4 / 3) + 2] = Math.min(255, b * brightnessFactor);
        imgData.data[i * (4 / 3) + 3] = 255; // full opacity
    }

    ctx.putImageData(imgData, 0, 0);

    return new Promise(resolve => {
        canvas.toBlob(blob => resolve(URL.createObjectURL(blob!)), 'image/webp');
    });
}
