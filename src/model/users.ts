import { StrictModel, UserModelType } from "@type/models";
import { model, models } from "mongoose";
import { StrictSchema, linkModel } from "./general";

const userModel = new StrictSchema<UserModelType>(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },
    usernameUpdatedAt: { type: Date, default: null },
    email: {
      type: String,
      unique: true,
      index: true,
      required: true,
    },
    emailUpdatedAt: { type: Date, default: null },
    dob: {
      type: Date,
      required: true,
    },
    bio: { type: String, default: "" },
    bioLinks: [linkModel],
    passkey: {
      type: String,
      required: true,
    },
    profile: { type: String, default: "" },
    isActive: { type: Boolean, default: true },

    // Metadata
    edited_at: { type: Date, default: null },
    session_id: { type: String, index: true },
    lastLoginAt: { type: Date, default: Date.now },
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

const User: StrictModel<UserModelType> =
  (models.User as StrictModel<UserModelType>) ||
  (model<UserModelType>("User", userModel) as StrictModel<UserModelType>);

export default User;
