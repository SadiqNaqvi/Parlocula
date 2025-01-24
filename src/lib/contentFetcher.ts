"use server";

import {
  convertGenresIntoId,
  refineMovieData,
  refineSearchData,
  refineShowData,
} from "./dataRefiner";
import {
  ExtraMovieData,
  FullMovieDetails,
  GeneralMovieReturn,
  GeneralShowReturn,
  FullPersonDetails,
  SearchCollectionReturn,
  SearchCompanyReturn,
  SearchPersonReturn,
  FullCollectionData,
  GeneralMovieData,
  GeneralShowData,
  GeneralPersonData,
  GeneralReturnType,
  GeneralCastData,
  GeneralCrewData,
  RefinedSearchData,
  RefinedMovieData,
  RefinedShowData,
  FullShowDetails,
  FullCompanyDetails,
} from "./types";

type MovieReturnType = { status: boolean; response: GeneralMovieReturn };
type ShowReturnType = { status: boolean; response: GeneralShowReturn };

export const fetchMovie = async (
  id: string
): Promise<RefinedMovieData | undefined> => {
  if (!id) return;
  try {
    const data: { status: boolean; response: FullMovieDetails } = await (
      await fetch(`https://testlalaapp.vercel.app/api/movie?id=${id}`)
    ).json();
    if (!data.status) {
      console.log("Error occured while fetching movie data: " + data.response);
      return;
    }

    const { title, release_date } = data.response;
    const extraData: { status: boolean; response: ExtraMovieData } = await (
      await fetch(
        `https://testlalaapp.vercel.app/api/extra?t=${title}&y=${new Date(
          release_date
        ).getFullYear()}`
      )
    ).json();

    if (!extraData.status) {
      console.log(
        "Error occured while fetching extra data: " + extraData.response
      );
      return;
    }

    return refineMovieData(
      data.response,
      data.response.credits.cast,
      data.response.credits.crew,
      data.response.videos.results,
      extraData.response
    );
  } catch (err: any) {
    console.error("Error occured while fetching movie  " + err.message);
    return;
  }
};

export const fetchMovieCredits = async (id: string) => {
  if (!id) return;
  try {
    const data: {
      status: boolean;
      response: {
        id: number;
        cast: GeneralCastData[];
        crew: GeneralCrewData[];
      };
    } = await (
      await fetch(`https://testlalaapp.vercel.app/api/movie/credits?id=${id}`)
    ).json();
    if (data.status) return data.response;
    console.error(
      "Some error occoured while fetching movie credits: " + data.response
    );
    return;
  } catch (err: any) {
    console.error(
      "Error occoured which fetching movie credits :" + err.message
    );
    return;
  }
};

export const fetchSimilarMovies = async (id: string, page: number = 1) => {
  if (!id) return;
  try {
    const data: MovieReturnType = await (
      await fetch(
        `https://testlalaapp.vercel.app/api/movie/similar?id=${id}&p=${page}`
      )
    ).json();
    if (data.status) return data.response;
    console.error(
      "Some erorr occoured while fetching movie recommendations: " +
        data.response
    );
    return;
  } catch (err: any) {
    console.error(
      "Error occured while fetching movie recommendations :" + err.message
    );
    return;
  }
};

export const fetchMoviesWithCast = async (
  id: string,
  page: number = 1,
  sort_by: string = "popularity"
) => {
  if (!id) return;
  try {
    const data: MovieReturnType = await (
      await fetch(
        `https://testlalaapp.vercel.app/api/movies?c=${id}&sort=${sort_by}&p=${page}`,
        { next: { revalidate: 3600 * 24 * 7 } }
      )
    ).json();
    if (data.status) return data.response;
    console.error(
      "Some erorr occoured while fetching movie with cast: " + data.response
    );
    return;
  } catch (err: any) {
    console.error(
      "Error occured while fetching movie with cast :" + err.message
    );
    return;
  }
};

export const fetchMoviesWithGenres = async ({
  genres,
  page = 1,
  sort_by = "popularity",
}: {
  genres: string;
  page: number;
  sort_by: string;
}) => {
  if (!genres) return;
  const id = convertGenresIntoId(genres, "movie");

  try {
    const data: MovieReturnType = await (
      await fetch(
        `https://testlalaapp.vercel.app/api/movies?g=${id}&sort=${sort_by}&p=${page}`
      )
    ).json();
    if (data.status) return data.response;
    console.error(
      "Some erorr occoured while fetching movies with genres: " + data.response
    );
    return;
  } catch (err: any) {
    console.error(
      "Error occured while fetching movies with genres:" + err.message
    );
    return;
  }
};

export const fetchMoviesWithYear = async (
  year: string,
  page: number = 1,
  sort_by: string = "popularity"
) => {
  const time = new Date(year).getTime();
  if (isNaN(time) || time > new Date().getTime()) return;

  try {
    const data: MovieReturnType = await (
      await fetch(
        `https://testlalaapp.vercel.app/api/movies?y=${year}&sort=${sort_by}&p=${page}`
      )
    ).json();
    if (data.status) return data.response;
    console.error(
      "Some erorr occoured while fetching movies with year: " + data.response
    );
    return;
  } catch (err: any) {
    console.error(
      "Error occured while fetching movies with year :" + err.message
    );
    return;
  }
};

export const fetchMoviesWithCompany = async (
  id: string,
  page: number = 1,
  sort_by: string = "popularity"
) => {
  if (!id) return;

  try {
    const data: MovieReturnType = await (
      await fetch(
        `https://testlalaapp.vercel.app/api/company/movies?id=${id}&sort=${sort_by}&p=${page}`
      )
    ).json();
    if (!data.status) return;
    return data.response;
  } catch (err: any) {
    console.error("Error fetching at FetchMovieWithCompany :" + err.message);
  }
};

export const fetchCollection = async (id: string) => {
  if (!id) return;
  try {
    const data: { status: boolean; response: FullCollectionData } = await (
      await fetch(`https://testlalaapp.vercel.app/api/collection?id=${id}`)
    ).json();
    if (data.status) return data.response;
    console.error(
      "Some erorr occoured while fetching collection: " + data.response
    );
    return;
  } catch (err: any) {
    console.error("Error occured while fetching collection: " + err.message);
    return;
  }
};

export const fetchCompany = async (id: string) => {
  if (!id) return;
  try {
    const data: { status: boolean; response: FullCompanyDetails } = await (
      await fetch(`https://testlalaapp.vercel.app/api/company?id=${id}`)
    ).json();
    if (data.status) return data.response;
    console.error(
      "Some erorr occoured while fetching company: " + data.response
    );
    return;
  } catch (err: any) {
    console.error("Error occured while fetching company:" + err.message);
    return;
  }
};

export const findWithIMDB = async (id: string) => {
  if (!id) return;
  try {
    const data: { status: boolean; response: any } = await (
      await fetch(`https://testlalaapp.vercel.app/api/find?id=${id}`)
    ).json();
    if (data.status) return data.response;
    console.error("Some erorr occoured while finding movie: " + data.response);
    return;
  } catch (err: any) {
    console.error("Error occured while finding movies:" + err.message);
    return;
  }
};

export const fetchNetwork = async (id: string) => {
  if (!id) return;
  try {
    const data: { status: boolean; response: FullCompanyDetails } = await (
      await fetch(`https://testlalaapp.vercel.app/api/network?id=${id}`)
    ).json();
    if (data.status) return data.response;
    console.error(
      "Some erorr occoured while fetching network: " + data.response
    );
    return;
  } catch (err: any) {
    console.error("Error occured while fetching network:" + err.message);
    return;
  }
};

export const fetchPerson = async (id: string) => {
  if (!id) return;
  try {
    const data: { status: boolean; response: FullPersonDetails } = await (
      await fetch(`https://testlalaapp.vercel.app/api/person?id=${id}`)
    ).json();
    if (data.status) return data.response;
    console.error(
      "Some erorr occoured while fetching person: " + data.response
    );
    return;
  } catch (err: any) {
    console.error("Error occured while fetching person:" + err.message);
    return;
  }
};

export const fetchShow = async (
  id: string
): Promise<RefinedShowData | undefined> => {
  if (!id) return;
  try {
    const data: { status: boolean; response: FullShowDetails } = await (
      await fetch(`https://testlalaapp.vercel.app/api/show?id=${id}`)
    ).json();
    if (!data.status) {
      console.log("Error occured while fetching show data: " + data.response);
      return;
    }

    const { name, first_air_date } = data.response;
    const extraData: { status: boolean; response: ExtraMovieData } = await (
      await fetch(
        `https://testlalaapp.vercel.app/api/extra?t=${name}&y=${new Date(
          first_air_date
        ).getFullYear()}`
      )
    ).json();

    if (!extraData.status) {
      console.log(
        "Error occured while fetching extra data: " + extraData.response
      );
      return;
    }

    return refineShowData(data.response, extraData.response);
  } catch (err: any) {
    console.error("Error occured while fetching movie  " + err.message);
    return;
  }
};

export const fetchSimilarShows = async (id: string, page: number = 1) => {
  if (!id) return;
  try {
    const data: MovieReturnType = await (
      await fetch(
        `https://testlalaapp.vercel.app/api/show/similar?id=${id}&p=${page}`
      )
    ).json();
    if (data.status) return data.response;
    console.error(
      "Some erorr occoured while fetching movie recommendations: " +
        data.response
    );
    return;
  } catch (err: any) {
    console.error(
      "Error occured while fetching movie recommendations :" + err.message
    );
    return;
  }
};

export const fetchShowsWithGenres = async ({
  genres,
  page = 1,
  sort_by = "popularity",
}: {
  genres: string;
  page: number;
  sort_by: string;
}) => {
  if (!genres) return;
  const ids = convertGenresIntoId(genres, "show");

  try {
    const data: ShowReturnType = await (
      await fetch(
        `https://testlalaapp.vercel.app/api/shows?g=${ids}&sort=${sort_by}&p=${page}`
      )
    ).json();
    if (data.status) return data.response;
    console.error(
      "Some erorr occoured while fetching shows with genres: " + data.response
    );
    return;
  } catch (err: any) {
    console.error(
      "Error occured while fetching shows with genres:" + err.message
    );
    return;
  }
};

export const searchCompany = async (
  query: string,
  page: number = 1
): Promise<
  (GeneralReturnType & { results: RefinedSearchData[] }) | undefined
> => {
  if (!query) return;
  try {
    const data: { status: boolean; response: SearchCompanyReturn } = await (
      await fetch(
        `https://testlalaapp.vercel.app/api/search?q=${query}&t=company&p=${page}`
      )
    ).json();
    if (data.status)
      return {
        ...data.response,
        results: refineSearchData(data.response.results, "company"),
      };
    console.error(
      "Some erorr occoured while searching company: " + data.response
    );
    return;
  } catch (err: any) {
    console.error("Error occured while searching company:" + err.message);
    return;
  }
};

export const searchCollection = async (
  query: string,
  page: number = 1
): Promise<
  (GeneralReturnType & { results: RefinedSearchData[] }) | undefined
> => {
  if (!query) return;
  try {
    const data: { status: boolean; response: SearchCollectionReturn } = await (
      await fetch(
        `https://testlalaapp.vercel.app/api/search?q=${query}&t=collection&p=${page}`
      )
    ).json();
    if (data.status)
      return {
        ...data.response,
        results: refineSearchData(data.response.results, "collection"),
      };
    console.error(
      "Some erorr occoured while searching collection: " + data.response
    );
    return;
  } catch (err: any) {
    console.error("Error occured while searching collection:" + err.message);
    return;
  }
};

export const searchMovie = async (
  query: string,
  page: number = 1
): Promise<
  (GeneralReturnType & { results: RefinedSearchData[] }) | undefined
> => {
  if (!query) return;
  try {
    const data: MovieReturnType = await (
      await fetch(
        `https://testlalaapp.vercel.app/api/search?q=${query}&t=movie&p=${page}`
      )
    ).json();
    if (data.status)
      return {
        ...data.response,
        results: refineSearchData(data.response.results, "movie"),
      };
    console.error(
      "Some erorr occoured while searching movies: " + data.response
    );
    return;
  } catch (err: any) {
    console.error("Error occured while searching movies:" + err.message);
    return;
  }
};

export const searchShow = async (
  query: string,
  page: number = 1
): Promise<
  (GeneralReturnType & { results: RefinedSearchData[] }) | undefined
> => {
  if (!query) return;
  try {
    const data: ShowReturnType = await (
      await fetch(
        `https://testlalaapp.vercel.app/api/search?q=${query}&t=tv&p=${page}`
      )
    ).json();
    if (data.status)
      return {
        ...data.response,
        results: refineSearchData(data.response.results, "show"),
      };
    console.error(
      "Some erorr occoured while searching shows: " + data.response
    );
    return;
  } catch (err: any) {
    console.error("Error occured while searching shows:" + err.message);
    return;
  }
};

export const searchPerson = async (
  query: string,
  page: number = 1
): Promise<
  (GeneralReturnType & { results: RefinedSearchData[] }) | undefined
> => {
  if (!query) return;
  try {
    const data: { status: boolean; response: SearchPersonReturn } = await (
      await fetch(
        `https://testlalaapp.vercel.app/api/search?q=${query}&t=person&p=${page}`
      )
    ).json();
    if (data.status)
      return {
        ...data.response,
        results: refineSearchData(data.response.results, "person"),
      };
    console.error(
      "Some erorr occoured while searching person: " + data.response
    );
    return;
  } catch (err: any) {
    console.error("Error occured while searching person:" + err.message);
    return;
  }
};

export const searchAllContent = async (
  query: string,
  page: number = 1
): Promise<
  (GeneralReturnType & { results: RefinedSearchData[] }) | undefined
> => {
  if (!query) return;
  try {
    const data: {
      status: boolean;
      response: GeneralReturnType & { results: any[] };
    } = await (
      await fetch(
        `https://testlalaapp.vercel.app/api/search?q=${query}&t=multi&p=${page}`
      )
    ).json();
    if (data.status)
      return {
        ...data.response,
        results: refineSearchData(data.response.results),
      };
    console.error(
      "Some erorr occoured while searching content: " + data.response
    );
    return;
  } catch (err: any) {
    console.error("Error occured while searching content:" + err.message);
    return;
  }
};

export const fetchTrendingMovies = async (page: number = 1) => {
  try {
    const data: MovieReturnType = await (
      await fetch(
        `https://testlalaapp.vercel.app/api/trending?t=movie&p=${page}`
      )
    ).json();
    if (data.status) return data.response;
    console.error(
      "Some erorr occoured while fetching trending movies: " + data.response
    );
    return;
  } catch (err: any) {
    console.error(
      "Error occured while fetching trending movies:" + err.message
    );
    return;
  }
};

export const fetchTrendingShows = async (page: number = 1) => {
  try {
    const data: ShowReturnType = await (
      await fetch(`https://testlalaapp.vercel.app/api/trending?t=tv&p=${page}`)
    ).json();
    if (data.status) return data.response;
    console.error(
      "Some erorr occoured while fetching trending shows: " + data.response
    );
    return;
  } catch (err: any) {
    console.error("Error occured while fetching trending shows:" + err.message);
    return;
  }
};

export const fetchTrendingPerson = async (page: number = 1) => {
  try {
    const data: { status: boolean; response: SearchPersonReturn } = await (
      await fetch(
        `https://testlalaapp.vercel.app/api/trending?t=person&p=${page}`
      )
    ).json();
    if (data.status) return data.response;
    console.error(
      "Some erorr occoured while fetching trending people: " + data.response
    );
    return;
  } catch (err: any) {
    console.error(
      "Error occured while fetching trending people:" + err.message
    );
    return;
  }
};

export const fetchTrendingContent = async (page: number = 1) => {
  try {
    const data: MovieReturnType | ShowReturnType = await (
      await fetch(`https://testlalaapp.vercel.app/api/trending?t=all&p=${page}`)
    ).json();
    if (data.status) return data.response;
    console.error(
      "Some erorr occoured while fetching trending content: " + data.response
    );
    return;
  } catch (err: any) {
    console.error(
      "Error occured while fetching trending content:" + err.message
    );
    return;
  }
};
