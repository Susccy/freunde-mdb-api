import { Router } from "express"

const router = Router()

router.get("/", (_req, res) => res.send("freunde-mdb API"))

export default router
