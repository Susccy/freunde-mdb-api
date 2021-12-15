import express from "express"
import cors from "cors"
import helmet from "helmet"
import type { ErrorRequestHandler } from "express"
import { BadRequestError } from "../api/errors/HTTPError"
import setRoutes from "./routes"

const app = express()

export const init = () => {
  const corsOptions = {
    origin: "http://localhost:3000",
  }

  app.use(cors(corsOptions))
  app.use(helmet())
  app.use(express.json())
  app.use(express.urlencoded({ limit: "10mb", extended: false }))

  // manually set env to production for error response testing
  // app.set("env", "production")

  setRoutes(app)

  // debug route for error handling testing
  // app.get("/test", (req, res, next) => {
  //   try {
  //     // validate req
  //     if (typeof req.query.foo !== "string") throw new BadRequestError()

  //     // ... handle request ...
  //     res.sendStatus(200)
  //   } catch (error) {
  //     next(error)
  //   }
  // })

  // const errorHandler: ErrorRequestHandler = (err, _req, res) => {
  //   // eslint-disable-next-line no-console
  //   console.error({ err })
  //   res.status(err.status || 500).send("Something broke!")
  // }

  // app.use(errorHandler)
}

export default app
