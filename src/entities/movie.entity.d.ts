import { Movie } from "~/api/models/movie.model"

export type MovieInput = Pick<
  Movie,
  "tmdbID" | "dateSeen" | "fsk" | "mm" | "rating"
>

/**
 * @todo genres als array?
 * ^^^^^^^^^^^^^^^^^
 * fsk?: number | undefined;
 * mm?: boolean | undefined;
 * genres?: string[] | undefined;
 * releaseDate?: string | undefined;
 * runtime?: number | undefined;
 * budget?: number | undefined;
 * revenue?: number | undefined;
 * dateSeen?: string;
 * "rating.ch"?: number;
 * "rating.rt"?: number;
 * "title.original"?: string;
 * "title.german"?: string;
 */
export type MoviePartial = Omit<
  Movie,
  | "rating"
  | "dateSeen"
  | "tmdbID"
  | "title"
  | "posterURL"
  | "tagline"
  | "overview"
> & {
  dateSeen?: string
  "rating.total"?: number
  "rating.ch"?: number
  "rating.rt"?: number
  "title.original"?: string
  "title.german"?: string
}

export type MovieResponse = Movie

export type MovieResponseJSON = Omit<
  MovieResponse,
  "dateSeen" | "releaseDate" | "id"
> & { dateSeen?: string; releaseDate: string; id: string }
