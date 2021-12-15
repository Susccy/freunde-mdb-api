import { Router } from "express"
import MovieController from "../controllers/movie.controller"

const router = Router()

router
  // spreading the get controller prevents a ts error (express/ts bug?)
  .get("/", ...MovieController.get)
  .get("/:id?", MovieController.getByID)
  .post("/", MovieController.post)
  .put("/:id", MovieController.put)
  .delete("/:id", MovieController.delete)

export default router
