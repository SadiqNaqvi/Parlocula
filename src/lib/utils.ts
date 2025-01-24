import mongoose from "mongoose";
import {
  cloudinary_image_uri,
  cloudinary_media_options,
  cloudinary_postKey,
} from "./constants";
import { ZodIssue } from "zod";
import placeholder from "@assets/placeholder.png";

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

export const timeAgo = (timestamp: number) => {
  if (!timestamp) return;

  const elapsed = Date.now() - timestamp;
  const secs = Math.floor(elapsed / 1000);
  const mins = Math.floor(secs / 60);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  const yrs = Math.floor(days / 365);

  const units = [
    { limit: 60 * 1000, message: "Just Now" },
    {
      limit: 60 * 60 * 1000,
      message: `${mins} min${mins > 1 ? "s" : ""} ago`,
    },
    {
      limit: 24 * 60 * 60 * 1000,
      message: `${hrs} hour${hrs > 1 ? "s" : ""} ago`,
    },
    {
      limit: 30 * 24 * 60 * 60 * 1000,
      message: `${days} day${days > 1 ? "s" : ""} ago`,
    },
    {
      limit: 365 * 24 * 60 * 60 * 1000,
      message: `${days / 30} month${days / 30 > 1 ? "s" : ""} ago`,
    },
    {
      limit: Infinity,
      message: `${yrs} year${yrs > 1 ? "s" : ""} ago`,
    },
  ];

  return units.find(({ limit }) => elapsed < limit)!.message;
};

export const numberConverter = (num: number): string => {
  const digits = Math.ceil(Math.log10(num + 1)); //num+1 because Math.log10 returns 2 for 100 and 3 for 101
  if (digits < 4) return num.toString();
  const category = ["", "K+", "M+", "B+", "T+", "Q+"];
  const comes = category[Math.ceil(digits / 3) - 1];
  const ignore = digits % 3; // counting the number of 0s to be ignored
  const numToShow = num.toString().slice(0, ignore || 3); // get the remaining number to show after ignoring 0s.
  return numToShow + comes;
};

export const calculateAge = (birthDate: Date): number => {
  if (isNaN(new Date(birthDate).getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  // Adjust the age if the user's birthday hasn't occurred this year yet
  const monthDifference = today.getMonth() - birthDate.getMonth();
  const dayDifference = today.getDate() - birthDate.getDate();

  if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
    age--;
  }

  return age;
};

export const objectToFormData = (object: Record<string, any>): FormData => {
  const formData = new FormData();
  Object.keys(object).forEach((key) => {
    if (key === "file" && !!object[key]) formData.append(key, object[key]);
    else formData.append(key, JSON.stringify(object[key]));
  });
  return formData;
};

export const formDataToObject = (response: FormData) => {
  const formDataObject: Record<string, any> = {};
  response.forEach((value, key) => {
    if (key === "file" && response.get("file") !== "null")
      formDataObject[key] = value;
    else formDataObject[key] = JSON.parse(value as string);
  });
  return formDataObject;
};

const convertOptionsToUrl = (options: any): string => {
  if (!options) return "";
  let optionsArr: string[] = [];
  Object.keys(options).forEach((key) => {
    if (cloudinary_media_options.hasOwnProperty(key))
      optionsArr.push(`${cloudinary_media_options[key]}${options[key]}`);
  });
  return optionsArr.join(",");
};

export const getInternalPoster = (
  path: string,
  options: any,
  folder?: string
): string => {
  if (!path) return placeholder.src;
  if (path.includes("https")) return path;
  const optionsUri = convertOptionsToUrl(options);

  const fullPath = `${cloudinary_image_uri}${
    optionsUri ? optionsUri + "/" : ""
  }${cloudinary_postKey + "/"}${folder ? folder + "/" : ""}${path}.webp`;
  return fullPath;
};

export const getThumbnail = (vid: string) => {
  if (!vid || !vid.includes("cloudinary")) return placeholder.src;
  const vidArr = vid.split(".");
  vidArr.pop();
  return vidArr.join(".").concat(".jpg");
};

export const isValidObjectId = (id: string) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const encodeBase64 = (payload: string) => {
  if (window && btoa) return btoa(payload);
  return Buffer.from(payload).toString("base64");
};

const decodeBase64 = (hash: string) => {
  if (window && atob) return atob(hash);
  return Buffer.from(hash, "base64").toString();
};

export const encodeObject = (object: any, expiry: number): string | null => {
  if (!object || !Object.keys(object).length) return null;
  if (!process.env.NEXT_PUBLIC_SALT)
    throw new Error("No Salt can be found while encoding sensetive object!");
  const hash = encodeBase64(
    JSON.stringify({ ...object, object_expiry: Date.now() + expiry })
  );
  const randomIndex = Math.floor(Math.random() * (hash.length + 1));
  return (
    hash.slice(0, randomIndex) +
    process.env.NEXT_PUBLIC_SALT +
    hash.slice(randomIndex)
  );
};

export const decodeObject = (hash: string): any => {
  if (!hash) return null;
  if (!process.env.NEXT_PUBLIC_SALT)
    throw new Error("No Salt can be found while decoding secret hash !");
  if (!hash.includes(process.env.NEXT_PUBLIC_SALT)) return null;
  const decoded = hash.replace(process.env.NEXT_PUBLIC_SALT, "");
  try {
    return JSON.parse(decodeBase64(decoded));
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const refineZodError = (
  errors: ZodIssue[]
): { path: string; message: string }[] => {
  return errors.map((error) => ({
    path: `${error.path[0]}`,
    message: error.message,
  }));
};

export const getPageParams = (params: string | null, initial: number = 1) => {
  if (!params) return initial;
  const param = parseInt(params); // could be "1" | "0" | "string";
  const page = isNaN(param) ? initial : param; // could be 1 | 0;
  return page < 1 ? initial : page; // will return number greater than 0;
};
