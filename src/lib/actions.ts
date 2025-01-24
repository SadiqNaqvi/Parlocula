"use server";

import axios from "axios";
import * as cheerio from "cheerio";
import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from "cloudinary";
import { ExternalLinkSchemaType } from "./schemas";
import { Resend } from "resend";
import EmailVerificationTemplate from "@components/EmailTemplate/emailVerification";
import { connectPPDB } from "./database";
import User, { UserData } from "@model/users";
import { cookies } from "next/headers";
import { getSession, verifyToken } from "./auth";

export const getMetadata = async (
  url: string
): Promise<ExternalLinkSchemaType | null> => {
  if (!url) return null;
  try {
    // Fetch the HTML content of the page
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    // Extract title
    const title =
      $("title").text() ||
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="title"]').attr("content");

    // Extract canonical URL
    const canonicalUrl =
      $('link[rel="canonical"]').attr("href") ||
      $('meta[property="og:url"]').attr("content") ||
      url;

    // Extract logo (favicon or logo from Open Graph)
    let logo: string =
      $('link[rel="apple-touch-icon"]').attr("href") ||
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      $('meta[property="og:image"]').attr("content") ||
      "";

    // If logo URL is relative, convert it to an absolute URL
    if (logo && !logo.startsWith("http")) {
      const urlObject = new URL(url);
      logo = urlObject.origin + logo;
    }

    // Return extracted metadata as an object
    return {
      title: title || "No title found",
      link: canonicalUrl,
      logo,
    };
  } catch (error: any) {
    console.error("Error fetching website metadata:", error.message);
    return null;
  }
};

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
});

export const mediaUploader = async (
  file: File,
  options?: UploadApiOptions
): Promise<
  | { result: UploadApiResponse; error: string; success: true }
  | { result: null; error: string; success: false }
> => {
  if (!file) return { result: null, error: "No file found.", success: false };

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  try {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(options, (err, res) => {
        if (err || !res) reject(err);
        else resolve(res);
      });
      stream.end(buffer);
    });

    return { result, success: true, error: "" };
  } catch (err) {
    console.log("Failed To Upload Media", err);
    return {
      result: null,
      success: false,
      error: "Something went wrong! Please Try again",
    };
  }
};

export const sendVerificationEmail = async () => {
  const resend = new Resend(process.env.RESEND_APIKEY);

  try {
    const { data, error } = await resend.emails.send({
      from: "Popcorn Paragon <naqvisadiqatwork@gmail.com>",
      to: ["naqvisadiq6@gmail.com"],
      subject: "Confirm Email",
      react: EmailVerificationTemplate({ code: 97832765 }),
    });

    if (error) return { result: null, error: error, success: false };

    return { result: data, error: "", success: true };
  } catch (err) {
    return { result: null, error: err, status: false };
  }
};

export const checkIfUserExist = async (email: string) => {
  try {
    const isDbConnected = await connectPPDB();
    if (!isDbConnected)
      return {
        result: null,
        success: false,
        error:
          "Database connection failed. Please check your connection and try again",
      };

    const resp = await User.exists({ email });
    return { result: !!resp, error: "", success: true };
  } catch (err) {
    console.log("Error occured while finding user in db", err);
    return {
      result: null,
      error: `Looks like your internet connection is not stable. Please check your connection and try again`,
      success: false,
    };
  }
};

export const isUsernameAvailable = async (username: string) => {
  try {
    const isDbConnected = await connectPPDB();
    if (!isDbConnected)
      return {
        result: null,
        success: false,
        error:
          "Database connection failed. Please check your connection and try again",
      };
    const resp = await User.exists({ username });
    return { result: !resp, error: "", success: true };
  } catch (err) {
    console.log("Error occured while finding user in db", err);
    return {
      result: null,
      error: `Looks like your internet connection is not stable. Please check your connection and try again`,
      success: false,
    };
  }
};

export const getCurrentUser = async () => {
  const token = cookies().get("token");
  if (!token) return null;
  try {
    const payload = verifyToken(token.value);
    if (typeof payload === "string" || !payload.exp) return null;
    if (payload.exp * 1000 > Date.now()) {
      const user = await UserData.findById(payload.user_id).populate(
        "user_id",
        "name username profile"
      );
      if (!user) return null;
      // const { user_id, genres, celeb, watch } = user;
      // const { name, username, profile } = user_id;
      return user;
    } else {
    }
  } catch (err) {
    console.log("Unable to get user:", err);
    return null;
  }
};
