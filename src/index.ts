import dotenv from "dotenv"
import server, { init as initServer } from "./config/server"
import connectDB from "./config/database"

dotenv.config()

connectDB()
  .then(() => {
    console.log("Connected to database.")
    initServer()
  })
  .catch((e) => console.error("Couldn't connect to database:", e))

const PORT = process.env.PORT || 3030

server.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`))
