import axios from "axios"

// axios.defaults.withCredentials = true

export const tmdbAPI = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: { Authorization: `Bearer ${process.env.PRIVATE__TMDB_API_TOKEN}` },
  params: { language: "de-DE" },
})

export const tmdbImage = axios.create({
  baseURL: "https://image.tmdb.org/t/p",
})
