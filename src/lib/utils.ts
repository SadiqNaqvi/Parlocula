import placeholder from "@assets/placeholder.png";
import { PaginatedData } from "@type/external";
import {
  AggregatedResponse,
  GeneralGetReturn,
  GeneralMultipleReturn,
  GenericDate,
  InfiniteQueryResponse
} from "@type/internal";
import {
  ArrayForArrayResponse,
  AvailableCacheTags,
  AvailableQueryKeys,
  AvailableRevalidateTags,
  CacheTagsArgs,
  ErrorCodes,
  ExternalImageType,
  ExtractPlaceholders,
  GetPosterFunctionProps,
  QueryFilterType,
  QueryKeyArgs,
  RevalidateTagsArgs
} from "@type/other";
import { InputFrame } from "@type/schemas";
import { customAlphabet } from "nanoid";
import { NextRequest } from "next/server";
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

export type ParseResponseType<T = Record<string, any>> = {
  json: T | null,
  text: string,
  ok: boolean,
  status: number,
}

export const parseResponse = async (response: Response): Promise<ParseResponseType> => {
  const body = await response.text();
  try {
    return {
      json: JSON.parse(body || "null"),
      text: body,
      ok: response.ok,
      status: response.status
    }
  } catch (_) {
    return {
      text: body,
      json: null,
      ok: response.ok,
      status: response.status
    }
  }
}

export const handleArrayForArrayResponse = <T, R>(input: T, result: R[]): ArrayForArrayResponse<T, R> => {
  if (Array.isArray(input)) {
    return result as ArrayForArrayResponse<T, R>;
  } else {
    return result[0] as ArrayForArrayResponse<T, R>;
  }
}

export const timeAgo = (timestamp: GenericDate | undefined, short?: boolean) => {
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

export const numberConverter = (num: number | undefined): string => {
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

export const makeUrlSafe = (str: string) => {
  if (!str) return "";

  return str
    .slice(0, 100)
    .replace(/[^\w\s]|_/g, "")
    .replace(/\s+/g, "-")
    .replace(/^_+|-+$/g, "");
};

export const getPoster = <T extends ExternalImageType>(config: GetPosterFunctionProps<T>): string => {
  const { path } = config;
  if (!path) return placeholder.src;
  if (path.includes("https")) return path;

  if (config.external || path?.startsWith('/')) {

    if (!config.size)
      return `${externalImgUrlPrefix}w185${path}`;

    const { size, type } = config;
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
  } else {
    const { path, type } = config;

    return `${cloudinary_uri}${type ?? "image"}/upload/${cloudinary_postKey}/${path}${type === "video" ? ".mp4" : ".webp"}`;
  }
};

export const checkAndReturn = <T>(prop: T, equals?: any, notEquals?: any): T | undefined => {
  if ((notEquals && prop === notEquals) || (equals && prop !== equals) || !Boolean(prop)) return undefined;
  else return prop;
}

export const getThumbnail = (vid: string) => {
  if (!vid || !vid.includes("cloudinary")) return placeholder.src;
  const vidArr = vid.split(".");
  vidArr.pop();
  return vidArr.join(".").concat(".jpg");
};

export const parloId = () => {
  const nanoid = customAlphabet(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    12,
  )
  return nanoid(12);
}

// export const isValidParloId = (id: string) => Boolean(id.length === 12);
export const isValidParloId = (id: string) => true;

export const getPageParams = (req: NextRequest, initial: number = 1) => {
  const searchParams = req.nextUrl.searchParams;
  const params = searchParams.get("p") || searchParams.get("page");
  if (!params) return initial;
  const param = parseInt(params); // could be "1" | "0" | "string";
  const page = isNaN(param) ? initial : param; // could be 1 | 0;
  return page < 1 ? initial : page; // will return number greater than 0;
};

type ReturnType<F> = {
  page: number,
  nsfw: boolean,
  filter: string | F,
  query: string | undefined
}

export const getSearchParams = <F extends string | undefined>(url: URL, initial = 1, fallbackFilter?: F): ReturnType<F> => {
  const sp = url.searchParams;
  const query = sp.get('q') || sp.get("query");
  const page = Math.max(Number(sp.get('p') || sp.get("page") || `${initial}`) || initial, initial) - 1;
  const nsfw = Boolean(sp.get("nsfw") === "true");
  const filter = sp.get("f") || sp.get("filter") || fallbackFilter;

  return { page, nsfw, filter, query } as ReturnType<F>
}

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
      : queryFilters[queryFilter]?.[0];
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
      (t, o) => t.replaceAll(`{${o}}`, `${options[o as ExtractPlaceholders<K>]}`),
      tag
    )
  );
};

export const getRevalidateTags = <K extends AvailableRevalidateTags>(
  available: AvailableRevalidateTags,
  options: Partial<RevalidateTagsArgs<K>>
) => {
  const tags = revalidateTags[available];
  if (!tags) return [];

  return tags.map((tag) =>
    Object.keys(options).reduce(
      (t, o) => o ? t.replaceAll(`{${o}}`, options[o as keyof RevalidateTagsArgs<K>] as string) : t,
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
  input: InputFrame | InputFrame[]
): Promise<{ files: any[]; filesData: any[] }> => {

  const frames = Array.isArray(input) ? input : [input];

  if (!frames || !frames?.length) return { files: [], filesData: [] };

  const promises = frames.map(async ({ blob, ...data }) => {

    if (!data.shouldUpload || !blob) return { data };

    const arrayBuffer = await blob.arrayBuffer();

    const file = new File([new Uint8Array(arrayBuffer)], "Parlocula", {
      type: blob.type,
    });

    return { file, data };

  });

  const results = await Promise.all(promises);

  const files = results.filter((res) => res.file).map((res) => res.file);
  const filesData = results.map((res) => res.data);

  return { files, filesData };
};

export const trycatch = <T>(
  func: () => Promise<T> | T,
  msg?: string
): Promise<T> | T => {
  try {
    return func();
  } catch (err: any) {
    console.error(msg || "Error occured:", err.message);
    return { success: false, errCode: "unstable_internet" } as T;
  }
};

export const refineResponseForQuery = async<T>(queryFn: () => Promise<GeneralGetReturn<T>>): Promise<T | null> => {
  const { success, errCode, result } = await queryFn();

  if (!success) throw new Error(errCode);

  return result ?? null;
}

export const refineResponseForInfiniteQuery = async<T>(
  queryFn: () => Promise<GeneralMultipleReturn<T> | GeneralGetReturn<PaginatedData>>,
  page: number
): Promise<InfiniteQueryResponse<T>> => {
  const { success, errCode, result } = await queryFn();

  if (!success) throw new Error(errCode);

  return infiniteScrollerResponse((result as AggregatedResponse<T>), page);

}

export const generateInitialData = (data: any[]) => ({
  data,
  total: data.length === queryLimit ? queryLimit + 1 : data.length,
});

export const getTimeInFuture = ({
  timeVal = 1,
  unit,
  from,
}: {
  unit: "m" | "h" | "d" | "mo" | "y";
  timeVal?: number;
  from?: GenericDate;
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
    getItem?: (p: NonNullable<P>) => T | T[]
  ): this {
    if (prop) {
      const item: T | T[] = getItem ? getItem(prop as NonNullable<P>) : prop as T;
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

export const checkEditedFields = <T extends Record<string, any>>(oldObj: T, newObj: Partial<T>): Partial<T> => {
  const objToReturn: Record<string, any> = {};
  Object.entries(newObj).forEach(([k, v]) => {
    if (v instanceof File) return;
    else if (JSON.stringify(oldObj[k]) === JSON.stringify(newObj[k])) return;
    objToReturn[k] = v;
  });

  return objToReturn as Partial<T>;
}

export const isEqual = <T>(propToCheck: T, ...conditions: T[]) => {
  return conditions.some(condition => condition === propToCheck)
}