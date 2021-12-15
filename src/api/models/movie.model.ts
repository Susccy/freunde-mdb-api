import { Schema, Model, model, models, ObjectId } from "mongoose"
import mongooseUniqueValidator from "mongoose-unique-validator"

export type RatingIndividual = { ch: number; rt: number }
export type RatingTotal = { total: number }

export interface Movie {
  // mongodb
  id: ObjectId

  // custom input
  rating: RatingTotal | (RatingTotal & RatingIndividual)
  dateSeen?: Date
  fsk?: number
  mm?: boolean

  // tmdb api data
  tmdbID: number
  title: { original: string; german?: string }
  genres: string[]
  releaseDate: Date
  runtime?: number
  posterURL?: string
  // reserved for custom movie input
  // posterFile?: { data: Buffer; contentType: string }
  budget: number
  revenue: number
  tagline?: string
  overview?: string
}

const ratingSchema = new Schema<Movie["rating"]>({
  total: {
    type: Number,
    required: true,
    validate: {
      validator (v: number) {
        return Number.isInteger(v) && v >= 0 && v <= 1000 && v % 25 === 0
      },
      message:
        "Expected total rating to be an integer in the range from 0 to 1000 and an increment of 25, but got {VALUE}.",
    },
  },
  ch: {
    type: Number,
    required (this: Movie["rating"]) {
      return "rt" in this && typeof this.rt === "number"
    },
    validate: {
      validator (v: number) {
        return Number.isInteger(v) && v >= 0 && v <= 1000 && v % 50 === 0
      },
      message:
        "Expected individual rating to be an integer in the range from 0 to 1000 and an increment of 50, but got {VALUE}.",
    },
  },
  rt: {
    type: Number,
    required (this: Movie["rating"]) {
      return "ch" in this && typeof this.ch === "number"
    },
    validate: {
      validator (v: number) {
        return Number.isInteger(v) && v >= 0 && v <= 1000 && v % 50 === 0
      },
      message:
        "Expected individual rating to be an integer in the range from 0 to 1000 and an increment of 50, but got {VALUE}.",
    },
  },
})

const movieSchema = new Schema<Movie>({
  // custom input
  tmdbID: { type: Number, required: true, unique: true },
  rating: {
    type: ratingSchema,
    validate: {
      validator (v: Movie["rating"]) {
        // console.log({
        //   v,
        //   result:
        //     ("ch" in v && typeof v.ch === "number") ||
        //     ("rt" in v && typeof v.rt === "number"),
        // })
        return ("ch" in v && typeof v.ch === "number") ||
          ("rt" in v && typeof v.rt === "number")
          ? (v.ch + v.rt) / 2 === v.total
          : true
      },
      message: "Individual ratings don't match total rating.",
    },
  },
  dateSeen: Date,
  fsk: {
    type: Number,
    validate: {
      validator (v: number) {
        return [0, 6, 12, 16, 18].includes(v)
      },
      message: "Expected FSK to be (0 | 6 | 12 | 16 | 18), but got {VALUE}.",
    },
  },
  mm: Boolean,

  // tmdb api data
  title: {
    original: { type: String, required: true },
    german: String,
  },
  releaseDate: { type: Date, required: true },
  runtime: { type: Number, required: true },
  genres: [String],
  posterURL: String,
  // reserved for custom movie input
  // posterFile: {
  //   data: { type: Buffer, required: true },
  //   contentType: { type: String, required: true },
  // },
  budget: { type: Number, required: true },
  revenue: { type: Number, required: true },
  tagline: String,
  overview: String,
})

movieSchema.set("toJSON", { getters: true, virtuals: true })

movieSchema.plugin(mongooseUniqueValidator)

// Try to use the existing model if it's been created before.
// Used to suppress a mongoose error on nuxt hot reload.
export default (models.Movie as Model<Movie>) ||
  model<Movie>("Movie", movieSchema)
