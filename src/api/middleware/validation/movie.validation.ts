import { body, param, query } from "express-validator"
import Validation from "./Validation"

// validate multiple fields at once: https://express-validator.github.io/docs/matched-data-api.html#gathering-data-from-multiple-locations
class MovieValidation extends Validation {
  get = this.validationHandler(
    query("sort")
      .optional()
      .isString(),
    query("limit")
      .optional()
      .isInt(),
    query("page")
      .optional()
      .isInt(),
    query(
      [
        "rating_total_min",
        "rating_total_max",
        "rating_ch_min",
        "rating_ch_max",
        "rating_rt_min",
        "rating_rt_max",
      ],
      "rating must be an integer in 0-1000"
    )
      .optional()
      .isInt({ min: 0, max: 1000 }),
    query([
      "date_seen_min",
      "date_seen_max",
      "date_released_min",
      "date_released_max",
    ])
      .optional()
      .isISO8601({ strict: true, strictSeparator: true }),
    query("fsk", "fsk must be 0, 6, 12, 16 or 18")
      .optional()
      .isInt()
      .isIn([0, 6, 12, 16, 18]),
    query("mm")
      .optional()
      .isBoolean(),
    query(["title_original", "title_german"])
      .optional()
      .isString(),
    query("genre")
      .optional()
      .isString(),
    query(["runtime_min", "runtime_max"])
      .optional()
      .isInt()
  )

  getByID = this.validationHandler(param("id").custom(this.isObjectID))

  post = this.validationHandler(
    body("tmdbID").isInt(),
    body("rating.total").isInt(),
    body("rating.ch")
      .if(body("rating.rt").exists())
      .isInt(),
    body("rating.rt")
      .if(body("rating.ch").exists())
      .isInt(),
    body("dateSeen")
      .optional()
      .isISO8601({ strict: true, strictSeparator: true }),
    body("fsk")
      .optional()
      .isInt(),
    body("mm")
      .optional()
      .isBoolean()
  )

  put = this.validationHandler(
    param("id").custom(this.isObjectID),
    body("tmdbID")
      .optional()
      .isInt(),
    body("rating.total")
      .optional()
      .isInt(),
    body("rating.ch")
      .optional()
      .isInt(),
    body("rating.rt")
      .optional()
      .isInt(),
    body("dateSeen")
      .optional()
      .isISO8601({ strict: true, strictSeparator: true }),
    body("fsk")
      .optional()
      .isInt(),
    body("mm")
      .optional()
      .isBoolean()
  )

  delete = this.validationHandler(param("id").custom(this.isObjectID))
}

export default new MovieValidation()
