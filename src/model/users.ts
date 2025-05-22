import { UserModelType } from "@type/models";
import { Schema, model, models } from "mongoose";
import { linkModel } from "./general";

const userModel = new Schema<UserModelType>(
  {
    name: {
      type: String,
      required: [true, "Name of the user is required"],
    },
    username: {
      type: String,
      unique: true,
      index: true,
      required: [true, "Name of the user is required"],
    },
    email: {
      type: String,
      unique: true,
      index: true,
      required: [true, "Email of the user is required"],
    },
    dob: {
      type: Date,
      required: [true, "Date of birth of the user is required"],
    },
    bio: { type: String, default: "" },
    bioLinks: [linkModel],
    initialGenres: {
      type: [String],
      required: [true, "Initial Genres are required"],
    },
    password: {
      type: String,
      required: [true, "Password of the user is required"],
    },
    profile: { type: String, default: "" },
    isActive: { type: Boolean, default: true },

    // Metadata
    edited_at: { type: Date, default: null },
    session_id: { type: String, index: true },
    lastLoginAt: { type: Date, default: Date.now() },
    isBanned: { type: Boolean, default: false },
    tempBanned: {
      type: Number,
      default: 0,
      set: (value: number) => Math.max(value, 0),
    },
    banEndsAt: { type: Date, default: null },
    followers: {
      type: Number,
      default: 0,
      set: (value: number) => Math.max(value, 0),
    },
    following: {
      type: Number,
      default: 0,
      set: (value: number) => Math.max(value, 0),
    },
    posts: {
      type: Number,
      default: 0,
      set: (value: number) => Math.max(value, 0),
    },
    comments: {
      type: Number,
      default: 0,
      set: (value: number) => Math.max(value, 0),
    },
    public_lists: {
      type: Number,
      default: 0,
      set: (value: number) => Math.max(value, 0),
    },
  },
  { timestamps: true }
);

userModel.index(
  {
    name: "text",
    username: "text",
  },
  {
    background: true,
    weights: { username: 10 }, // Prioritize username matches
    name: "user_username_text_index",
    default_language: "english", // Handles stemming (e.g., "review" matches "reviews")
    collation: {
      locale: "en", // Case and punctuation-insensitive
      strength: 2,
    },
  }
);

const User = models.User || model<UserModelType>("User", userModel);

export default User;
