import placeholder from "@assets/placeholder.png";
import {
  AvailableCacheTags,
  AvailableRevalidateTags,
  CloudinaryMediaObject,
  CloudinaryMediaOptions,
  QueryFilterType,
} from "@type/other";
import { InfiniteQueryResponse } from "@type/internal";
import { InputFrame } from "@type/schemas";
import { Types } from "mongoose";
import { NextRequest } from "next/server";
import { ZodIssue } from "zod";
import {
  cacheTags,
  cloudinary_image_uri,
  cloudinary_media_options,
  cloudinary_postKey,
  errorCodes,
  queryFilters,
  queryLimit,
  revalidateTags,
} from "./constants";

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

export const timeAgo = (timestamp: number | Date) => {
  if (!timestamp) return;
  const time = new Date(timestamp).getTime();

  const elapsed = Date.now() - time;
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
      message: `${Math.ceil(days / 30)} month${days / 30 > 1 ? "s" : ""} ago`,
    },
    {
      limit: Infinity,
      message: `${yrs} year${yrs > 1 ? "s" : ""} ago`,
    },
  ];

  return units.find(({ limit }) => elapsed < limit)!.message;
};

export const numberConverter = (num: number): string => {
  if (!num) return "0";
  if (num < 1000) return num.toString();
  const digits = Math.ceil(Math.log10(num + 1)); //num+1 because Math.log10 returns 2 for 100 and 3 for 101
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
    if (key === "files" && Array.isArray(object.files) && object.files.length)
      object.files.forEach((file) => formData.append("files", file));
    else formData.append(key, JSON.stringify(object[key]));
  });
  return formData;
};

export const formDataToObject = (formData: FormData) => {
  const formDataObject: Record<string, any> = {};
  for (const [key, value] of formData.entries()) {
    if (key === "files") {
      const prevFiles = formDataObject.files ?? [];
      formDataObject.files =
        value instanceof File ? [...prevFiles, value] : formDataObject.files??[];
    } else formDataObject[key] = JSON.parse(value as string);
  }
  return formDataObject;
};

const convertOptionsToUrl = (options: CloudinaryMediaObject): string => {
  if (!options) return "";
  let optionsArr: string[] = [];
  Object.keys(options).forEach((key: any) => {
    if (cloudinary_media_options.hasOwnProperty(key))
      optionsArr.push(
        `${cloudinary_media_options[key as CloudinaryMediaOptions]}${
          options[key as CloudinaryMediaOptions]
        }`
      );
  });
  return optionsArr.join(",");
};

export const getInternalPoster = ({
  options,
  folder,
  path,
}: {
  path?: string;
  options: CloudinaryMediaObject;
  folder?: string;
}): string => {
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

export const ObjectId = (id: string) => {
  return new Types.ObjectId(id);
};

export const isValidObjectId = (id: string) => {
  if (!id) return false;
  return Types.ObjectId.isValid(ObjectId(id));
};

export const encodeObject = (
  object: any,
  expiry: number
): Buffer<ArrayBuffer> | null => {
  if (!object || !Object.keys(object).length) return null;
  if (!process.env.NEXT_PUBLIC_SALT)
    throw new Error("No Salt can be found while encoding sensetive object!");

  const hash = Buffer.from(
    JSON.stringify({ ...object, object_expiry: Date.now() + expiry })
  ).toString("base64");

  const randomIndex = Math.floor(Math.random() * (hash.length + 1));
  const hashWithSalt =
    hash.slice(0, randomIndex) +
    process.env.NEXT_PUBLIC_SALT +
    hash.slice(randomIndex);

  return Buffer.from(hashWithSalt);
};

export const decodeObject = (
  hashArr: Buffer<ArrayBuffer> | undefined | null
): any => {
  if (!hashArr) return null;
  const salt = process.env.NEXT_PUBLIC_SALT;
  if (!salt)
    throw new Error("No Salt can be found while decoding secret hash!");
  const hash = Buffer.from(hashArr).toString();
  if (!hash.includes(salt)) return null;
  try {
    const decoded = Buffer.from(hash.replace(salt, ""), "base64").toString();
    return JSON.parse(decoded);
  } catch (err: any) {
    console.error("Error decoding Object", err.message);
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

export const getPageParams = (req: NextRequest, initial: number = 1) => {
  const searchParams = req.nextUrl.searchParams;
  const params = searchParams.get("p") || searchParams.get("page");
  if (!params) return initial;
  const param = parseInt(params); // could be "1" | "0" | "string";
  const page = isNaN(param) ? initial : param; // could be 1 | 0;
  return page < 1 ? initial : page; // will return number greater than 0;
};

export const convertCodeIntoError = (
  code: string,
  formError?: ZodIssue[] | null
) => {
  if (code === "pp203" && formError) return formError;
  return errorCodes[code]?.message ?? "Something went wrong! Please try again.";
};

export const infiniteScrollerResponse = (
  response:
    | {
        data: any[];
        total: number;
      }
    | InfiniteQueryResponse,
  page: number
): InfiniteQueryResponse => {
  if ("total_results" in response) return response;
  return {
    results: response.data,
    page,
    total_pages: Math.ceil(response.total / queryLimit),
    total_results: response.total,
  };
};

export const refineSearchParams = (
  queryFilter: QueryFilterType,
  p?: string,
  f?: string
) => {
  const page: number = parseInt(p || "1") || 1;
  const filter: string =
    f && queryFilters[queryFilter].includes(f || "")
      ? f
      : queryFilters[queryFilter][0];
  return { page, filter };
};

type CacheTagsType =
  | {
      type: "cache";
      available: AvailableCacheTags;
      options: any;
    }
  | {
      type: "revalidate";
      available: AvailableRevalidateTags;
      options: any;
    };

export const getCacheTags = ({ available, options, type }: CacheTagsType) => {
  const tags =
    type === "cache"
      ? cacheTags[available]
      : type === "revalidate"
      ? revalidateTags[available]
      : undefined;
  if (!tags) return [];

  return tags.map((tag) =>
    Object.keys(options).reduce(
      (t, o) => t.replaceAll(`{${o}}`, options[o]),
      tag
    )
  );
};

export const readyFrames = async (
  frames: InputFrame[]
): Promise<{ files: any[]; filesData: any[] }> => {
  if (!frames || !frames?.length) return { files: [], filesData: [] };
  const promises = frames.map(async ({ blob, ...data }) => {
    if (data.isExternal || !blob) return { data };
    const arrayBuffer = await blob.arrayBuffer();
    const file = new File([new Uint8Array(arrayBuffer)], "Popcorn Paragon");
    return { file, data };
  });

  const results = await Promise.all(promises);

  const files = results.filter((res) => res.file).map((res) => res.file);
  const filesData = results.map((res) => res.data);

  return { files, filesData };
};

export const trycatch = async <T = any>(func: () => T, msg?: string) => {
  try {
    return await func();
  } catch (err: any) {
    console.error(msg || "Error occured:", err.message);
    return { success: false, errCode: "pp500" };
  }
};
