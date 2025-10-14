import placeholder from "@assets/placeholder.png";
import {
  GeneralGetReturn,
  GeneralMultipleReturn,
  GeneralPostReturn,
  GenericDate,
  InfiniteQueryResponse,
} from "@type/internal";
import {
  AvailableCacheTags,
  AvailableQueryKeys,
  AvailableRevalidateTags,
  CacheTagsArgs,
  ErrorCodes,
  getPosterFunctionProps,
  QueryFilterType,
  QueryKeyArgs,
  RevalidateTagsArgs
} from "@type/other";
import { InputFrame } from "@type/schemas";
import { Types } from "mongoose";
import { NextRequest } from "next/server";
import toast from "react-hot-toast";
import {
  cacheTags,
  cloudinary_postKey,
  cloudinary_uri,
  errorCodes,
  externalImgUrlPrefix,
  queryFilters,
  queryKeys,
  queryLimit,
  revalidateTags
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

export const timeAgo = (timestamp: GenericDate, short?: boolean) => {
  if (!timestamp) return;
  const time = new Date(timestamp).getTime();

  const elapsed = Date.now() - time;
  const secs = Math.floor(elapsed / 1000);
  const mins = Math.floor(secs / 60);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  const mons = Math.ceil(days / 30);
  const yrs = Math.floor(days / 365);

  const units = [
    {
      limit: 60 * 1000,
      message: short ? "now" : "just now"
    },
    {
      limit: 60 * 60 * 1000,
      message: short ? `${mins} m` : `${mins} min${mins > 1 ? "s" : ""} ago`,
    },
    {
      limit: 24 * 60 * 60 * 1000,
      message: short ? `${hrs} h` : `${hrs} hour${hrs > 1 ? "s" : ""} ago`,
    },
    {
      limit: 30 * 24 * 60 * 60 * 1000,
      message: short ? `${days} d` : `${days} day${days > 1 ? "s" : ""} ago`,
    },
    {
      limit: 365 * 24 * 60 * 60 * 1000,
      message: short ? `${mons} mo` : `${mons} month${days / 30 > 1 ? "s" : ""} ago`,
    },
    {
      limit: Infinity,
      message: short ? `${yrs} y` : `${yrs} year${yrs > 1 ? "s" : ""} ago`,
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

export const calculateAge = (bday: GenericDate): number => {
  const birthDate = new Date(bday);

  if (isNaN(birthDate.getTime())) return 0;

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

export const objectToFormData = (
  object: Record<string, any>
): FormData | null => {
  if (!object) return object;
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
        value instanceof File
          ? [...prevFiles, value]
          : (formDataObject.files ?? []);
    } else if (value === "undefined") {
      formDataObject[key] = undefined;
    } else {
      formDataObject[key] = JSON.parse(value as string);
    }
  }
  return formDataObject;
};

export const refineString = (str: string) => {
  if (!str) return "";

  return str
    .slice(0, 100)
    .replace(/[^\w\s]|_/g, "")
    .replace(/\s+/g, "-")
    .replace(/^_+|-+$/g, "");
};

export const getPoster = (config: getPosterFunctionProps): string => {
  if (!config.external) {
    const { path, type } = config;
    if (!path) return placeholder.src;
    if (path.includes("https")) return path;

    return `${cloudinary_uri}${type ?? "image"}/upload/${cloudinary_postKey}/${path}${type === "video" ? ".mp4" : ".webp"}`;
  } else {
    const { path, size, type } = config;
    if (!path) return placeholder.src;
    switch (type) {
      case "poster":
        return `${externalImgUrlPrefix}${size}${path}`;
      case "backdrop":
        return `${externalImgUrlPrefix}${size}${path}`;
      case "logo":
        return `${externalImgUrlPrefix}${size}${path}`;
      case "profile":
        return `${externalImgUrlPrefix}${size}${path}`;
      case "still":
        return `${externalImgUrlPrefix}${size}${path}`;
      default:
        return "";
    }
  }
};

export const getThumbnail = (vid: string) => {
  if (!vid || !vid.includes("cloudinary")) return placeholder.src;
  const vidArr = vid.split(".");
  vidArr.pop();
  return vidArr.join(".").concat(".jpg");
};

export const ObjectId = (id?: string) => {
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

export const getPageParams = (req: NextRequest, initial: number = 1) => {
  const searchParams = req.nextUrl.searchParams;
  const params = searchParams.get("p") || searchParams.get("page");
  if (!params) return initial;
  const param = parseInt(params); // could be "1" | "0" | "string";
  const page = isNaN(param) ? initial : param; // could be 1 | 0;
  return page < 1 ? initial : page; // will return number greater than 0;
};

export const handleMutationResponse = async <T = any>({
  response,
  message,
  onSuccess,
}: {
  response: GeneralPostReturn;
  message?: string;
  onSuccess?: (result: T) => unknown;
}) => {
  const { success, customError, errCode, formError, result } = response;
  if (success) {
    await onSuccess?.(result);
  } else {
    if (formError) return formError;
    else if (customError) return customError;

    const error =
      (errCode && errorCodes[errCode]?.message) ??
      "Something went wrong! Please try again.";

    message && toast.error(message);
    toast.error(error);
  }
};

export const codetoError = (errCode: ErrorCodes): string => {
  return (
    errorCodes[errCode]?.message ?? "Something went wrong! Please try again."
  );
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
  const { data, total } = response;
  const results = Array.isArray(data) ? data : [];
  const totalRes = total && !isNaN(total) ? total : 0;

  return {
    results,
    page,
    total_pages: Math.ceil(totalRes / queryLimit),
    total_results: totalRes,
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

export const getCacheTags = <K extends AvailableCacheTags>(
  available: AvailableCacheTags,
  options: CacheTagsArgs<K>
) => {
  const tags = cacheTags[available];
  if (!tags) return [];

  return tags.map((tag) =>
    Object.keys(options).reduce(
      (t, o) => t.replaceAll(`{${o}}`, options[o as keyof typeof options]),
      tag
    )
  );
};

export const getRevalidateTags = <K extends AvailableRevalidateTags>(
  available: AvailableRevalidateTags,
  options: RevalidateTagsArgs<K>
) => {
  const tags = revalidateTags[available];
  if (!tags) return [];

  return tags.map((tag) =>
    Object.keys(options).reduce(
      (t, o) => t.replaceAll(`{${o}}`, options[o as keyof RevalidateTagsArgs<K>]),
      tag
    )
  );
};

export const getQueryKeys = <K extends AvailableQueryKeys>(
  available: K,
  options: QueryKeyArgs<K>
): string[] => {
  const keys = queryKeys[available];
  if (!keys) return [];

  return keys.map((key) =>
    Object.keys(options).reduce(
      (t, o) => t.replaceAll(`{${o}}`, options[o as keyof QueryKeyArgs<K>]),
      key
    )
  );
};

export const readyFrames = async (
  frames: InputFrame[]
): Promise<{ files: any[]; filesData: any[] }> => {
  if (!frames || !frames?.length) return { files: [], filesData: [] };
  const promises = frames.map(async ({ blob, ...data }) => {
    if (!data.shouldUpload || !blob) return { data };
    const arrayBuffer = await blob.arrayBuffer();
    const file = new File([new Uint8Array(arrayBuffer)], "Popcorn Paragon", {
      type: blob.type,
    });
    return { file, data };
  });

  const results = await Promise.all(promises);

  const files = results.filter((res) => res.file).map((res) => res.file);
  const filesData = results.map((res) => res.data);

  return { files, filesData };
};

export const trycatch = <T = GeneralPostReturn>(
  func: () => Promise<T> | T,
  msg?: string
): Promise<T> | T => {
  try {
    return func();
  } catch (err: any) {
    console.error(msg || "Error occured:", err.message);
    return { success: false, errCode: "unknown_error" } as T;
  }
};

type GetReturns = GeneralGetReturn | GeneralMultipleReturn;
export const queryFunction = async <
  F extends (...args: any[]) => Promise<GetReturns>,
  P extends number | undefined,
>(
  func: F,
  args: Parameters<F>,
  page?: P
): Promise<P extends number ? InfiniteQueryResponse : (unknown | null)> => {
  const { success, errCode, result } = await func(...args);
  if (!success) throw new Error(errCode);
  return page ? infiniteScrollerResponse(result, page) : (result ?? null);
};

export const generateInitialData = (data: any[]) => ({
  data,
  total: data.length === queryLimit ? queryLimit + 1 : data.length,
});

export const getLocalUrl = () => {
  return process.env.NEXT_PUBLIC_APP_ROOT ?? "";
};

export const getTimeInFuture = ({
  timeVal = 1,
  unit,
  from,
}: {
  unit: "m" | "h" | "d" | "mo" | "y";
  timeVal?: number;
  from?: Date | number;
}) => {
  const provided = from && new Date(from).getTime();
  const now = provided && !isNaN(provided) ? provided : Date.now();
  switch (unit) {
    case "m":
      return now + 1000 * 60 * timeVal;
    case "h":
      return now + 1000 * 3600 * timeVal;
    case "d":
      return now + 1000 * 3600 * 24 * timeVal;
    case "mo":
      return now + 1000 * 3600 * 24 * 30 * timeVal;
    case "y":
      return now + 1000 * 3600 * 24 * 365 * timeVal;
  }
};

class ConditionalArray<T> extends Array<T> {
  /**
   * @param prop The condition to be checked to concat the item in the array.
   * @param getItem The function to get the item(s) to be concatenated in the array only if the condition resolves to true. The Non-Nullable `prop` parameter is passed as an argument.
   * @returns The modified array with the item(s) concatenated if condition resolves to true else the same array.
   *
   * Checks the condition, if the condition resolves to true, it `pushes` the item(s) returned from `getItem` function in the array and returns the modified array otherwise returns the same array.
   */
  concatConditionally<P extends unknown>(
    prop: P,
    getItem: (p: NonNullable<P>) => T | T[]
  ): this {
    if (prop) {
      const item = getItem(prop as NonNullable<P>);
      const items = Array.isArray(item) ? item : [item];
      this.push(...items);
    }
    return this;
  }
}

export const createArray = <T>(initial: T | T[]): ConditionalArray<T> => {
  const array = Array.isArray(initial) ? initial : [initial];
  return new ConditionalArray<T>(...array);
};

export const isMilestoneReached = (n: number | undefined | null) => {
  if (!n || n < 10) return false;
  const num = Number(n.toString().replaceAll("0", ""));
  return [10, 25, 50].includes(num < 10 ? num * 10 : num);
};

export const capitalize = (str: string) => {
  if (!str || !str.at(0)) return "";
  return (str.at(0) ?? "").toUpperCase().concat(str.slice(1, str.length));
};

// type FieldsWithObject<O, F extends string> = O & {
//   [K in F]: unknown
// }

// export const checkFieldsInObject = <O extends Object, F extends string>(fields: F[], object: O): FieldsWithObject<O, F> | null => {

//   const check = fields.every(field => {
//     if (field in object) return true;
//     else return false;
//   })

//   if (check) return object as FieldsWithObject<O, F>;
//   else return null;

// }

export const checkEditedFields = (oldObj: Record<string, any>, newObj: Record<string, any>) => {
  const objToReturn: Record<string, any> = {};
  Object.entries(newObj).forEach(([k, v]) => {
    if (v instanceof File) return;
    else if (JSON.stringify(oldObj[k]) === JSON.stringify(newObj[k])) return;
    objToReturn[k] = v;
  });

  return objToReturn;
}