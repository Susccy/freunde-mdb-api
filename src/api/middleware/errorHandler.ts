/**
 * https://stackoverflow.com/questions/69709998/express-error-handling-not-working-in-nuxt-js-servermiddleware
 */

import type { ErrorRequestHandler } from "express"
import { BadRequestError } from "../errors/HTTPError"

const MONGOOSE_VALIDATION_ERROR = "ValidationError"

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err, `\n${JSON.stringify(err, null, 2)}`)

  let errorResponse = err

  errorResponse instanceof BadRequestError
    ? // assume it's an express-validator error
      Array.isArray(errorResponse.details) &&
      (errorResponse.details = errorResponse.details.map(({ msg, param }) => ({
        param,
        errorType: msg,
      })))
    : // otherwise might be a mongoose validation error
      err.name === MONGOOSE_VALIDATION_ERROR &&
      (errorResponse = new BadRequestError(
        Object.values<{ path: string; kind: string }>(err.errors).map(
          ({ path, kind }) => ({ param: path, errorType: kind })
        )
      ))

  res
    .header("content-type", "application/json")
    .status(errorResponse.status || errorResponse.statusCode || 500)
    .end(JSON.stringify({ details: errorResponse.details }))
}

export default errorHandler
