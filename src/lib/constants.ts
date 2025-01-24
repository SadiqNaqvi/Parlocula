export const movie_genres: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  sciencefiction: 878,
  tvmovie: 10770,
  thriller: 53,
  war: 10752,
  western: 37,
};

export const show_genres: Record<string, number> = {
  action: 10759,
  adventure: 10759,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  kids: 10762,
  mystery: 9648,
  news: 10763,
  reality: 10764,
  scifi: 10765,
  fantasy: 10765,
  soap: 10766,
  talk: 10767,
  war: 10768,
  politics: 10768,
  western: 37,
};

export const genresToChoose = [
  "action",
  "adventure",
  "animation",
  "comedy",
  "thriller",
  "crime",
  "drama",
  "family",
  "fantasy",
  "horror",
  "mystery",
  "romance",
  "science fiction",
  "war",
  "tv movie",
  "music",
  "history",
  "documentary",
  "western",
];

export const postTags = [
  "",
  "Discussion",
  "Question",
  "Roast/Joke",
  "Information",
  "Others",
];

export const urlPattern =
  /^https:\/\/(www\.)?[a-zA-Z0-9-]{2,}(\.[a-zA-Z0-9-]{2,})+(\/[^\s]*)?(\?[^\s]*)?$/;

export const passwordValidator =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

export const usernamePattern = /^[a-z][a-z0-9_]*$/;

export const emailPattern =
  /^[a-zA-Z]+[a-zA-Z0-9-]{2,}\@+[a-z]{4,}\.[a-z]{3,}$/;

export const imgUrl = "https://image.tmdb.org/t/p/";

export const backdrop_sizes = ["w300", "w780", "w1280", "original"];
export const logo_sizes = [
  "w45",
  "w92",
  "w154",
  "w185",
  "w300",
  "w500",
  "original",
];
export const poster_sizes = [
  "w92",
  "w154",
  "w185",
  "w342",
  "w500",
  "w780",
  "original",
];
export const profile_sizes = ["w45", "w185", "h632", "original"];
export const still_sizes = ["w92", "w185", "w300", "original"];

export const maxImageSize = 1024 * 1024 * 3;
export const allowedImageTypes = [
  "image/jpg",
  "image/png",
  "image/jpeg",
  "image/webp",
];

export const cloudinary_media_options: Record<string, string> = {
  aspect_ratio: "ar_",
  crop: "c_",
  width: "w_",
  height: "h_",
  quality: "q_",
  filer: "f_",
  round: "r_",
};

export const cloudinary_image_uri =
  "https://res.cloudinary.com/dwpbmrgsx/image/upload/";
export const cloudinary_video_uri =
  "https://res.cloudinary.com/dwpbmrgsx/video/upload/";
export const cloudinary_postKey = "v1731487676";

export const paginatedQueryLimit = 20;
