import mongoose, { Schema, models } from "mongoose";

const movieSchema = new Schema(
  {
    title: {
      type: String,
      unique: [true, "Movie Already Exist!"],
      required: true,
    },
    synopsis: {
      type: String,
      required: true,
    },
    plot: {
      type: String,
      required: true,
    },
    poster: {
      type: String,
      required: true,
    },
    imdb_id: {
      type: String,
      required: true,
      unique: [true, "Movie Already Exist!"],
    },
    rating: {
      type: String,
      required: true,
    },
    maturity_rating: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    runtime: {
      type: String,
      required: true,
    },
    released: {
      type: Number,
      required: true,
    },
    release_year: {
      type: Number,
      required: true,
    },
    genre: {
      type: Array,
      required: true,
    },
    cast: {
      type: Array,
      required: true,
    },
    writers: {
      type: Array,
      required: true,
    },
    directors: {
      type: Array,
      required: true,
    },
    country: {
      type: Array,
      required: true,
    },
    language: {
      type: Array,
      required: true,
    },
    provider: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Movie = models.Movie || mongoose.model("Movie", movieSchema);