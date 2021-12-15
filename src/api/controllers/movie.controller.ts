import type { RequestHandler } from "express"
import { BadRequestError, NotFoundError } from "../errors/HTTPError"
import MovieService from "../services/movie.service"
import { MovieValidation } from "../middleware/validation"
import type { MovieInput, MovieResponse } from "~/entities/movie.entity"

type ID = { id: string }

// @todo { [k: string]: string } best practice?
interface MovieController {
  get: [
    typeof MovieValidation.get,
    RequestHandler<
      unknown,
      MovieResponse[],
      unknown,
      { [k: string]: string | undefined }
    >
  ]
  getByID: [typeof MovieValidation.getByID, RequestHandler<ID, MovieResponse>]
  post: [
    typeof MovieValidation.post,
    RequestHandler<unknown, MovieResponse, MovieInput>
  ]
  put: [
    typeof MovieValidation.put,
    RequestHandler<ID, MovieResponse, { [k: string]: string }>
  ]
  delete: [typeof MovieValidation.delete, RequestHandler<ID>]
}

const movieController: MovieController = {
  get: [
    MovieValidation.get,
    async (req, res, next) => {
      try {
        const { limit, page, sort, ...query } = req.query

        const validQueryParams = [
          ["rating_total_min", "rating.total"],
          ["rating_total_max", "rating.total"],
          ["rating_ch_min", "rating.ch"],
          ["rating_ch_max", "rating.ch"],
          ["rating_rt_min", "rating.rt"],
          ["rating_rt_max", "rating.rt"],
          ["date_seen_min", "dateSeen"],
          ["date_seen_max", "dateSeen"],
          ["fsk", "fsk"],
          ["mm", "mm"],
          ["title", "$or"],
          ["genre", "genres"],
          ["date_released_min", "releaseDate"],
          ["date_released_max", "releaseDate"],
          ["runtime_min", "runtime"],
          ["runtime_max", "runtime"],
        ]

        const validQuery = Object.entries(query).reduce<{
          [k: string]: string | any[] | { [k: string]: string } | undefined
        }>((validQuery, [queryParamName, queryParamValue]) => {
          if (!queryParamValue) return validQuery

          const validQueryParam = validQueryParams.find(
            (v) => v[0] === queryParamName
          )

          if (!validQueryParam) return validQuery

          const [validParamName, dbParamPath] = validQueryParam

          const paramIsTitle = validParamName === "title"
          const paramIsMin = /_min$/.test(validParamName)
          const paramIsMax = !paramIsMin && /_max$/.test(validParamName)

          return {
            ...validQuery,
            [dbParamPath]: paramIsTitle
              ? [
                  {
                    "title.original": {
                      $regex: new RegExp(queryParamValue, "i"),
                    },
                  },
                  {
                    "title.german": {
                      $regex: new RegExp(queryParamValue, "i"),
                    },
                  },
                ]
              : paramIsMin
              ? {
                  ...(validQuery[dbParamPath] as Record<string, never>),
                  $gte: queryParamValue,
                }
              : paramIsMax
              ? {
                  ...(validQuery[dbParamPath] as Record<string, never>),
                  $lte: queryParamValue,
                }
              : queryParamValue,
          }
        }, {})

        const options = {
          ...(limit && { limit: parseInt(limit) }),
          ...(page && { page: parseInt(page) }),
          sort,
        }

        const results: MovieResponse[] = await MovieService.find(
          validQuery,
          options
        )

        res.status(200).json(results)
      } catch (err) {
        next(err)
      }
    },
  ],

  getByID: [
    MovieValidation.getByID,
    async (req, res, next) => {
      try {
        const { id } = req.params

        const result = await MovieService.findByID(id)

        if (!result) throw new NotFoundError()

        res.status(200).json(result)
      } catch (err) {
        next(err)
      }
    },
  ],

  post: [
    MovieValidation.post,
    async (req, res, next) => {
      try {
        const doc = req.body

        const inserted = await MovieService.insert(doc)

        res.status(201).json(inserted)
      } catch (err) {
        next(err)
      }
    },
  ],

  put: [
    MovieValidation.put,
    async (req, res, next) => {
      try {
        const updated: MovieResponse | null = await MovieService.update(
          req.params.id,
          req.body
        )
        if (!updated) throw new NotFoundError()
        return res.status(201).json(updated)
      } catch (err) {
        next(err)
      }
    },
  ],

  delete: [
    MovieValidation.delete,
    async (req, res, next) => {
      try {
        const { id } = req.params
        const deleted = await MovieService.delete(id)
        if (!deleted.deletedCount) throw new NotFoundError()
        return res.status(200).json(deleted)
      } catch (err) {
        next(err)
      }
    },
  ],
}

export default movieController
