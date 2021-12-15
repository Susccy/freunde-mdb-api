import { validationResult } from "express-validator"
import { isValidObjectId } from "mongoose"
import type { ValidationChain } from "express-validator"
import type { Request, Response, NextFunction } from "express"
import { BadRequestError } from "../../errors/HTTPError"

abstract class Validation {
  protected validationHandler (...validations: ValidationChain[]) {
    return async (req: Request, _res: Response, next: NextFunction) => {
      try {
        await Promise.all(validations.map((validation) => validation.run(req)))
        const errors = validationResult(req)
        if (!errors.isEmpty()) throw new BadRequestError(errors.array())
        next()
      } catch (err) {
        next(err)
      }
    }
  }

  protected isObjectID (value: any) {
    return isValidObjectId(value)
  }
}

export default Validation
