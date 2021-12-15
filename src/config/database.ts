import { connect } from "mongoose"

// Change env var depending on deployment.
export default async () => {
  await connect(process.env.PRIVATE__MONGODB_URI!)
}
