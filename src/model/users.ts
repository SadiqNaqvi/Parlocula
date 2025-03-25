import { UserDataModelType, UserModelType } from "@type/modelTypes";
import { Schema, model, models } from "mongoose";
import { linkModel, reportModel } from "./general";

const userModel = new Schema<UserModelType>(
  {
    name: {
      type: String,
      required: [true, "Name of the user is required"],
    },
    username: {
      type: String,
      unique: true,
      required: [true, "Name of the user is required"],
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email of the user is required"],
    },
    dob: {
      type: Date,
      required: [true, "Date of birth of the user is required"],
    },
    bio: { type: String, default: "" },
    bioLinks: [linkModel],
    genres: {
      type: [String],
      required: [true, "Initial Genres are required"],
    },
    password: {
      type: String,
      required: [true, "Password of the user is required"],
    },
    profile: { type: String, default: "" },
    editedAt: { type: Date, default: null },
    session_id: { type: String, default: null },
    follower_count: { type: Number, default: 0 },
    following_count: { type: Number, default: 0 },
    post_count: { type: Number, default: 0 },
    lastLoginAt: { type: Date, default: Date.now() },
    isBanned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userModel.index({ username: 1, email: 1 });

const User = models.User || model<UserModelType>("User", userModel);

const userMetadataModel = new Schema<UserDataModelType>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User Id is required to store metadata."],
  },
  email: {
    type: String,
    required: [true, "User's email is required"],
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  genres: [String],
  celebs: { type: [String], default: [] },
  watch: { type: [String], default: [] },
  reports: { type: [reportModel], default: [] },
});

userMetadataModel.index({ user_id: 1, email: 1, username: 1 });

export const UserData = models.UserData || model("UserData", userMetadataModel);

export default User;
