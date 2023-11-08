import _debounce from 'lodash/debounce'

import { API_START_URL, API_KEY, API_READ_ACC_TOKEN } from '../config'

export default class MoviesService {
  // eslint-disable-next-line class-methods-use-this
  async reqRes(url, options = {}) {
    try {
      const { method = 'GET', headers = {}, body = null } = options

      const requestOptions = {
        method,
        headers: {
          accept: 'application/json',
          ...headers,
        },
        body: body && JSON.stringify(body),
      }

      const res = await fetch(url, requestOptions)

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Could not fetch ${url}, received ${res.status}: ${errorText}`)
      }

      const data = await res.json()
      return data
    } catch (error) {
      if (!window.navigator.onLine) {
        throw new Error('Check your internet connection.')
      } else {
        throw error
      }
    }
  }

  async getPopularMovies() {
    const url = `${API_START_URL}movie/popular?language=en-US&page=1&api_key=${API_KEY}`
    const options = {
      method: 'GET',
    }
    return this.reqRes(url, options)
  }

  async getRatedMovies(guestSessionId, page) {
    const url = `${API_START_URL}guest_session/${guestSessionId}/rated/movies?language=en-US&page=${page}&api_key=${API_KEY}&sort_by=created_at.asc`
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
    }
    return this.reqRes(url, options)
  }

  async getRatedMoviesDebounced(guestSessionId, page, retries = 3) {
    try {
      const response = await this.getRatedMovies(guestSessionId, page)
      if (!response.success && retries > 0) {
        await this.getRatedMoviesDebounced(guestSessionId, page, retries - 1)
      }
      return response
    } catch (error) {
      if (retries > 0) {
        await this.getRatedMoviesDebounced(guestSessionId, page, retries - 1)
      } else {
        throw new Error(
          `Error fetching rated movies for guest session ${guestSessionId}: ${error.message}. Max retries reached.`
        )
      }
    }

    return null
  }

  async searchMovies(query, page) {
    const url = `${API_START_URL}search/movie?query=${query}&include_adult=false&language=en-US&page=${page}&api_key=${API_KEY}`
    const options = {
      method: 'GET',
    }
    return this.reqRes(url, options)
  }

  async createGuestSession() {
    const url = `${API_START_URL}authentication/guest_session/new?api_key=${API_KEY}`
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
      },
    }
    return this.reqRes(url, options)
  }

  async getGenres() {
    const url = `${API_START_URL}genre/movie/list?language=en`
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_READ_ACC_TOKEN}`,
      },
    }
    return this.reqRes(url, options)
  }

  async rateMovie(movieId, rating, guestSessionId) {
    let newRating = rating

    if (typeof newRating !== 'number' || newRating <= 0) {
      newRating = 0.5
    }
    const url = `${API_START_URL}movie/${movieId}/rating?guest_session_id=${guestSessionId}&api_key=${API_KEY}`
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: { value: newRating.toString() },
    }

    const response = await this.reqRes(url, options)

    return response
  }

  rateMovieDebounced = _debounce(async (movieId, rating, guestSessionId, retries = 3) => {
    try {
      const response = await this.rateMovie(movieId, rating, guestSessionId)

      if (!response.success) {
        if (retries > 0) {
          await this.rateMovieDebounced(movieId, rating, guestSessionId, retries - 1)
        }
      }
    } catch (error) {
      if (retries > 0) {
        await this.rateMovieDebounced(movieId, rating, guestSessionId, retries - 1)
      } else {
        throw new Error(
          `Error rating movie ${movieId}: ${error.message}. Max retries reached. Could not rate the movie.`
        )
      }
    }
  }, 300)
}
