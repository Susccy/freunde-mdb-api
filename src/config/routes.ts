import type { Express } from "express"
import { index, movie } from "../api/routes"

export default (app: Express) => {
  app.use("/", index).use("/movie", movie)

  console.log("Created server routes.")
}
