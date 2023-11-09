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
    const url = `${API_START_URL}guest_session/${guestSessionId}/rated/movies?api_key=${API_KEY}&language=en-US&page=${page}`
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
    }
    return this.reqRes(url, options)
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

    const url = `${API_START_URL}movie/${movieId}/rating?api_key=${API_KEY}&guest_session_id=${guestSessionId}`
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
}
