import React, { Component } from 'react'
import { Spin, Alert, Input, Pagination, Tabs } from 'antd'
import { format } from 'date-fns'
import _debounce from 'lodash/debounce'

import MoviesService from '../services/movies-service'

import MoviesList from './movies-list'
import { MoviesServiceProvider } from './movies-context'
import './movies-app.css'

function getDeviceType() {
  const screenWidth = window.innerWidth
  if (screenWidth < 1010) {
    return 'mobile'
  }
  return 'desktop'
}

export default class MoviesApp extends Component {
  MoviesService = new MoviesService()

  deviceType = getDeviceType()

  state = {
    moviesData: [],
    ratedMoviesData: [],
    loading: false,
    error: null,
    searchQuery: '',
    currentPage: 1,
    ratedPage: 1,
    totalResults: null,
    totalRated: null,
    genres: [],
    guestSessionId: localStorage.getItem('guest_session_id'),
    appMode: 'search',
    ratedMovies: JSON.parse(localStorage.getItem('stored_rated_movies')) || {},
    ratedMoviesDataCopy: JSON.parse(localStorage.getItem('rated_movies_data_copy')) || [],
    alert: { type: '', mess: '' },
  }

  async componentDidMount() {
    await this.fetchGenres()
    await this.createGuestSession()
    await this.fetchPopularMovies()
  }

  async handleSearch(query, page = 1) {
    this.setState({ searchQuery: query, currentPage: page, loading: true, error: null })
    const moviesService = new MoviesService()

    try {
      const data = await moviesService.searchMovies(query, page)
      this.setState({
        moviesData: data.results,
        loading: false,
        error: null,
        totalResults: data.total_results,
      })
    } catch (error) {
      this.setState({ loading: false, error: error.message })
    }
  }

  handleSearchInputChange = _debounce((value) => {
    if (value.trim() === '' || value === null) {
      this.fetchPopularMovies()
    } else {
      this.handleSearch(value)
    }
  }, 600)

  handlePageChange = (page) => {
    const { searchQuery, appMode, guestSessionId } = this.state

    if (appMode === 'search') {
      this.handleSearch(searchQuery, page)
      this.setState({ currentPage: page })
    } else if (appMode === 'rated') {
      this.fetchRatedMovies(guestSessionId, page)
      this.setState({ ratedPage: page })
    }
  }

  handlePageChangeDebounced = _debounce(this.handlePageChange, 300)

  saveRatedMovie = (movieId, rating, movie) => {
    this.showAlert('info', 'Rating saving process')

    this.setState(
      (prevState) => {
        const { ratedMovies, ratedMoviesDataCopy } = prevState

        const existingMovieIndex = ratedMoviesDataCopy.findIndex((m) => m.id === movieId)

        const updatedRatedMoviesDataCopy =
          existingMovieIndex !== -1
            ? ratedMoviesDataCopy.map((m) => (m.id === movieId ? { ...m, rating } : m))
            : [...ratedMoviesDataCopy, { ...movie, rating }]

        return {
          ratedMovies: {
            ...ratedMovies,
            [movieId]: rating,
          },
          ratedMoviesDataCopy: updatedRatedMoviesDataCopy,
        }
      },
      () => {
        const { ratedMovies, ratedMoviesDataCopy } = this.state

        localStorage.setItem('stored_rated_movies', JSON.stringify(ratedMovies))
        localStorage.setItem('rated_movies_data_copy', JSON.stringify(ratedMoviesDataCopy))

        this.showAlert('success', 'Rated movies updated and saved.')
      }
    )
  }

  showAlert = (type, message) => {
    this.setState({
      alert: {
        type,
        message,
      },
    })

    const duration = message.length * 100

    setTimeout(() => {
      this.setState({
        alert: { type: '', mess: '' },
      })
    }, duration)
  }

  async fetchRatedMovies(guestSessionId, page = 1) {
    this.setState({ loading: true, error: null })

    try {
      const data = await this.MoviesService.getRatedMovies(guestSessionId, page)
      const { ratedMoviesDataCopy } = this.state
      const defaultPageSize = 20

      if (data.total_results < ratedMoviesDataCopy.length) {
        const startIndex = (page - 1) * defaultPageSize
        const endIndex = startIndex + defaultPageSize
        const slicedData = ratedMoviesDataCopy.slice(startIndex, endIndex)

        this.setState({
          ratedMoviesData: slicedData,
          loading: false,
          error: null,
          totalRated: ratedMoviesDataCopy.length,
        })

        this.showAlert(
          'warning',
          'Problems synchronizing with the server, local data temporarily used to display rated films.'
        )
      } else {
        this.setState({
          ratedMoviesData: data.results,
          loading: false,
          error: null,
          totalRated: data.total_results,
        })
        this.showAlert('success', 'Rated films successfully received from the server.')
      }
    } catch (error) {
      this.showAlert('error', `Error receiving rated films: ${error.message}`)
      this.setState({ loading: false, error: error.message })
    }
  }

  async fetchPopularMovies() {
    this.setState({ loading: true, error: null })

    try {
      const data = await this.MoviesService.getPopularMovies()
      this.setState({ moviesData: data.results, loading: false, error: null, totalResults: data.results.length })
    } catch (error) {
      this.setState({ loading: false, error: error.message })
    }
  }

  async fetchGenres() {
    try {
      const data = await this.MoviesService.getGenres()
      this.setState({ genres: data.genres })
      this.showAlert('success', 'Genres were obtained successfully.')
    } catch (error) {
      this.showAlert('error', `Error getting genres: ${error.message}`)
    }
  }

  async createGuestSession() {
    try {
      const storedSession = localStorage.getItem('guest_session_id')
      const expiresAt = new Date(localStorage.getItem('expires_at'))
      const storedRatedMovies = JSON.parse(localStorage.getItem('stored_rated_movies'))
      if (storedSession && expiresAt) {
        const currentTime = new Date()
        if (currentTime < expiresAt) {
          this.showAlert(
            'info',
            `Welcome back! An existing guest session is used. Session expires: ${format(expiresAt, 'dd-MM-yyyy HH:mm')}`
          )
          this.setState({ guestSessionId: storedSession, ratedMovies: storedRatedMovies })
        } else {
          this.showAlert('warning', 'Welcome back! The guest session has expired. Some data will be updated.')
          localStorage.removeItem('guest_session_id')
          localStorage.removeItem('expires_at')
          localStorage.removeItem('stored_rated_movies')
          localStorage.removeItem('rated_movies_data_copy')
        }
      } else {
        const data = await this.MoviesService.createGuestSession()
        this.setState({ guestSessionId: data.guest_session_id, ratedMovies: {} })
        localStorage.setItem('guest_session_id', data.guest_session_id)
        localStorage.setItem('expires_at', data.expires_at)
        this.showAlert(
          'success',
          `Guest session created and saved successfully. Session expires: ${format(
            new Date(data.expires_at),
            'dd-MM-yyyy HH:mm'
          )}`
        )
      }
    } catch (error) {
      this.showAlert('error', `Error creating guest session: ${error.message}`)
    }
  }

  render() {
    const {
      moviesData,
      ratedMoviesData,
      loading,
      error,
      currentPage,
      ratedPage,
      totalResults,
      totalRated,
      genres,
      guestSessionId,
      appMode,
      ratedMovies,
      searchQuery,
      alert,
    } = this.state

    const size = this.deviceType === 'mobile' ? 'default' : 'large'

    const items = [
      {
        key: 'search',
        label: ' Search ',
        children: (
          <div className="movies-app__wrapper">
            <Input
              className="movies-app__search-input search-input"
              id="search-input"
              placeholder="Type to search..."
              onChange={(e) => this.handleSearchInputChange(e.target.value)}
            />
            {loading && <Spin className="movies-app__spin spin" size="large" />}
            {error && (
              <Alert
                className="movies-app__main-alert main-alert"
                message="Error"
                description={error}
                type="error"
                showIcon
              />
            )}
            {!loading && !error && totalResults === 0 && (
              <Alert className="movies-app__main-alert main-alert" message="No results found" type="info" showIcon />
            )}
            {!loading && !error && totalResults > 0 && (
              <>
                <MoviesList
                  moviesData={moviesData || []}
                  saveRatedMovie={this.saveRatedMovie}
                  guestSessionId={guestSessionId}
                  deviceType={this.deviceType}
                />{' '}
                <Pagination
                  className="movies-app__pagination pagination"
                  current={currentPage}
                  total={totalResults}
                  defaultPageSize={20}
                  showSizeChanger={false}
                  hideOnSinglePage
                  onChange={this.handlePageChangeDebounced}
                  style={{ display: 'flex', justifyContent: 'center' }}
                />
              </>
            )}
          </div>
        ),
      },
      {
        key: 'rated',
        label: ' Rated ',
        children: (
          <div>
            {loading && <Spin className="movies-app__spin spin" size="large" />}
            {error && (
              <Alert
                className="movies-app__main-alert main-alert"
                message="Error"
                description={error}
                type="error"
                showIcon
              />
            )}
            {!loading && !error && totalRated === 0 && (
              <Alert
                className="movies-app__main-alert main-alert"
                message="No rated movies found"
                type="info"
                showIcon
              />
            )}
            {!loading && !error && totalRated > 0 && (
              <>
                <MoviesList
                  moviesData={ratedMoviesData || []}
                  guestSessionId={guestSessionId}
                  saveRatedMovie={this.saveRatedMovie}
                />{' '}
                <Pagination
                  className="movies-app__pagination pagination"
                  current={ratedPage}
                  total={totalRated}
                  defaultPageSize={20}
                  showSizeChanger={false}
                  hideOnSinglePage
                  onChange={this.handlePageChangeDebounced}
                  style={{ display: 'flex', justifyContent: 'center' }}
                />
              </>
            )}
          </div>
        ),
      },
    ]

    return (
      <MoviesServiceProvider value={{ moviesService: this.MoviesService, genres, appMode, ratedMovies }}>
        <main className="movies-app">
          {alert.message && (
            <Alert
              className="movies-app__additional-alert additional-alert"
              message={alert.message}
              type={alert.type}
              showIcon
            />
          )}
          <Tabs
            defaultActiveKey="search"
            activeKey={appMode}
            items={items}
            onChange={(key) => {
              if (key === 'rated') {
                this.fetchRatedMovies(guestSessionId, ratedPage)
              } else if (key === 'search' && searchQuery.trim() === '') {
                this.fetchPopularMovies()
              } else if (key === 'search') {
                this.handleSearch(searchQuery, currentPage)
              }
              this.setState({ appMode: key })
            }}
            centered
            size={size}
            indicatorSize={(origin) => origin * 1.4}
          />
        </main>
      </MoviesServiceProvider>
    )
  }
}
