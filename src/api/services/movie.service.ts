/* eslint-disable camelcase */
import { FilterQuery, UpdateQuery } from "mongoose"
import MovieModel, { Movie } from "../models/movie.model"
import { tmdbAPI } from "../../config/axios"
import type { MovieInput } from "~/entities/movie.entity"

export interface TMDBMovieDetails {
  adult: boolean
  backdrop_path: string | null
  belongs_to_collection: {
    id: number
    name: string
    poster_path: string
    backdrop_path: string
  } | null
  budget: number
  genres: { id: number; name: string }[]
  homepage: string | null
  id: number
  imdb_id: string | null
  original_language: string
  original_title: string
  overview: string | null
  popularity: number
  poster_path: string | null
  production_companies: {
    id: number
    logo_path: string | null
    name: string
    origin_country: string
  }[]
  production_countries: {
    iso_3166_1: string
    name: string
  }[]
  release_date: string
  revenue: number
  runtime: number | null
  spoken_languages: {
    iso_639_1: string
    name: string
  }[]
  status:
    | "Rumored"
    | "Planned"
    | "In Production"
    | "Post Production"
    | "Released"
    | "Canceled"
  tagline: string | null
  title: string
  video: boolean
  vote_average: number
  vote_count: number
}

interface TMDBMovieDetailsParsedLean {
  title: { original: string; german?: string }
  releaseDate: Date
  genres: string[]
  runtime?: number
  posterURL?: string
}

interface TMDBMovieDetailsParsed extends TMDBMovieDetailsParsedLean {
  budget: number
  revenue: number
  tagline?: string
  overview?: string
}

type ResultType<T> = T extends true
  ? TMDBMovieDetailsParsedLean
  : TMDBMovieDetailsParsed

function parseMovieDetailsResponse<T extends boolean> (
  response: TMDBMovieDetails,
  lean: T
): ResultType<T> {
  const { original_title, title, release_date, runtime, genres, poster_path } =
    response

  const parsedResponseLean: TMDBMovieDetailsParsedLean = {
    title: { original: original_title, ...(title && { german: title }) },
    releaseDate: new Date(release_date),
    genres: genres.map((genre) => genre.name),
    ...(runtime && { runtime }),
    ...(poster_path && { posterURL: poster_path }),
  }

  if (lean) return parsedResponseLean as ResultType<T>

  const { budget, revenue, tagline, overview } = response

  const parsedResponse: TMDBMovieDetailsParsed = {
    ...parsedResponseLean,
    budget,
    revenue,
    ...(tagline && { tagline }),
    ...(overview && { overview }),
  }

  return parsedResponse as ResultType<T>
}

export default {
  find: async (
    query: FilterQuery<Movie> = {},
    options: { page?: number; limit?: number; sort?: string } = {}
  ) => {
    const { page = 0, limit = 0, sort } = options

    const freundeData = await MovieModel.find(query)
      .sort(sort)
      .skip(page * limit)
      .limit(limit)
      .select("-__v")
      .exec()

    const freundeDataLean = freundeData.map((mongooseDocument) =>
      mongooseDocument.toJSON()
    )

    return freundeDataLean
    // const tmdbDataAsync = []

    // for (const movie of freundeDataLean) {
    //   typeof movie.tmdb === "number" &&
    //     tmdbDataAsync.push(
    //       tmdbAPI
    //         .get<TMDBMovieDetails>(`/movie/${movie.tmdb}`)
    //         .then((res) => res.data)
    //     )
    // }

    // const tmdbData = await Promise.allSettled(tmdbDataAsync).then((results) =>
    //   results.map((result) => ("value" in result ? result.value : null))
    // )

    // const tmdbDataIdObject = tmdbData.reduce<{
    //   [k: number]: TMDBMovieDetailsParsedLean
    // }>((tmdbDataIdObject, tmdbDataItem) => {
    //   if (tmdbDataItem)
    //     tmdbDataIdObject[tmdbDataItem.id] = parseMovieDetailsResponse(
    //       tmdbDataItem,
    //       true
    //     )
    //   return tmdbDataIdObject
    // }, {})

    // const combinedData: MovieResponse[] = []
    // for (const { tmdb, ...movie } of freundeDataLean) {
    //   combinedData.push({
    //     ...movie,
    //     tmdb:
    //       typeof tmdb === "number" && tmdb in tmdbDataIdObject
    //         ? tmdbDataIdObject[tmdb]
    //         : tmdb,
    //   })
    // }

    // return combinedData
  },

  findByID: async (id: string) =>
    await MovieModel.findById(id)
      .select("-__v")
      .exec(),
  // if (!freundeData) return null

  // const { tmdb, ...movie } = freundeData
  // const tmdbData =
  //   typeof tmdb === "number"
  //     ? await tmdbAPI
  //         .get<TMDBMovieDetails>(`/movie/${tmdb}`)
  //         .then((res) => (res ? parseMovieDetailsResponse(res.data) : tmdb))
  //         .catch(() => tmdb)
  //     : tmdb

  // return { ...movie, tmdb: tmdbData }

  insert: async (doc: MovieInput) => {
    const { tmdbID } = doc

    const tmdbResponse = await tmdbAPI
      .get<TMDBMovieDetails>(`/movie/${tmdbID}`)
      .then(({ data }) => parseMovieDetailsResponse(data, false))
      .catch((e) => {
        console.error(e.response)
        throw e
      })

    const completeDoc: Omit<Movie, "rating" | "id"> &
      Pick<MovieInput, "rating"> = {
      ...doc,
      ...tmdbResponse,
    }

    return await new MovieModel(completeDoc).save()
  },

  // @todo enable update validation
  update: async (id: string, doc: UpdateQuery<Movie>) =>
    await MovieModel.findByIdAndUpdate(id, doc, { new: true }).exec(),

  delete: async (id: string) => await MovieModel.deleteOne({ _id: id }).exec(),
}
