import mongoose, { Schema, models } from "mongoose";
import { reportModel } from "./general";

const userModel = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name of the user is required"],
    },
    username: {
      type: String,
      unique: [true, "User name not available"],
      required: [true, "Name of the user is required"],
    },
    email: {
      type: String,
      unique: [true, "A user with this email already exist"],
      required: [true, "Email of the user is required"],
    },
    dob: {
      type: Date,
      required: [true, "Date of birth of the user is required"],
    },
    bio: {
      type: String,
      default: "",
    },
    genres: {
      type: [String],
      required: [true, "Initial Genres are required"],
    },
    password: {
      type: String,
      required: [true, "Password of the user is required"],
    },
    profile: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

const User = models.User || mongoose.model("User", userModel);

const userMetadataModel = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User Id is required to store metadata."],
  },
  email: {
    type: String,
    required: [true, "User's email is required"],
    unique: [true, "User already exist with this email"],
  },
  username: {
    type: String,
    required: true,
  },
  genres: [String],
  celebs: {
    type: [String],
    default: [],
  },
  watch: {
    type: [String],
    default: [],
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  reports: {
    type: [reportModel],
    default: [],
  },
  followers: {
    type: Number,
    default: 0,
  },
  following: {
    type: Number,
    default: 0,
  },
  post_count: {
    type: Number,
    default: 0,
  },
  comments_count: {
    type: Number,
    default: 0,
  },
  collection_count: {
    type: Number,
    default: 0,
  },
  public_collection_count: {
    type: Number,
    default: 0,
  },
  recommendations_count: {
    type: Number,
    default: 0,
  },
  favourites_count: {
    type: Number,
    default: 0,
  },
  recently_joined: {
    type: [Schema.Types.ObjectId],
  },
});

const UserData =
  models.UserData || mongoose.model("UserData", userMetadataModel);

export default User;
export { UserData };
