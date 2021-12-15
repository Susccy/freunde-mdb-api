abstract class HTTPError extends Error {
  constructor (public status: number, public details?: any) {
    super()
    this.status = status
    this.details = details
  }
}

export class BadRequestError extends HTTPError {
  constructor (public details?: any) {
    super(400, details)
  }
}

export class UnauthorizedError extends HTTPError {
  constructor () {
    super(401)
  }
}

export class ForbiddenError extends HTTPError {
  constructor () {
    super(403)
  }
}

export class NotFoundError extends HTTPError {
  constructor () {
    super(404)
  }
}

export class ConflictError extends HTTPError {
  constructor () {
    super(409)
  }
}

export class InternalServerError extends HTTPError {
  constructor () {
    super(500)
  }
}
