import { API_START_URL, API_KEY } from '../config'

export default class MoviesService {
  // eslint-disable-next-line class-methods-use-this
  async getResource(url) {
    try {
      const res = await fetch(`${url}`, {
        headers: {
          accept: 'application/json',
        },
      })

      if (!res.ok) {
        throw new Error(`Could not fetch ${url}, received ${res.status}`)
      }

      return res.json()
    } catch (error) {
      if (!window.navigator.onLine) {
        throw new Error('Check your internet connection.')
      } else {
        throw error
      }
    }
  }

  async getPopularMovies() {
    const res = await this.getResource(`${API_START_URL}&api_key=${API_KEY}`)
    return res
  }

  async searchMovies(query, page) {
    const res = await this.getResource(
      `https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=${page}&api_key=${API_KEY}`
    )
    console.log(res.total_results, 'total_results')
    return res
  }
}
