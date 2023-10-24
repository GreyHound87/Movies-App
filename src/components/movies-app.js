import React, { Component } from 'react'
import { Spin, Alert, Input, Pagination } from 'antd'
import _debounce from 'lodash/debounce'

import MoviesService from '../services/movies-service'

import MoviesList from './movies-list'

export default class MoviesApp extends Component {
  state = {
    moviesData: [],
    loading: false,
    error: null,
    searchQuery: '',
    currentPage: 1,
    totalResults: null,
  }

  async componentDidMount() {
    console.log('componentDidMount!')
    this.fetchPopularMovies()
  }

  async handleSearch(query, page = 1) {
    this.setState({ searchQuery: query, currentPage: page, loading: true, error: null })
    console.log('handleSearch!', query)
    const moviesService = new MoviesService()

    try {
      const data = await moviesService.searchMovies(query, page)
      console.log('handleSearch GOT!', data)
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
    this.handleSearch(value)
  }, 600)

  handlePageChange = (page) => {
    const { searchQuery } = this.state
    this.handleSearch(searchQuery, page)
  }

  async fetchPopularMovies() {
    console.log('loading start list!')
    const moviesService = new MoviesService()
    this.setState({ loading: true, error: null })

    try {
      const data = await moviesService.getPopularMovies()
      console.log('Got!', data)
      this.setState({ moviesData: data.results, loading: false, error: null, totalResults: data.results.length })
    } catch (error) {
      this.setState({ loading: false, error: error.message })
    }
  }

  render() {
    const { moviesData, loading, error, currentPage, totalResults } = this.state

    return (
      <main
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          background: '#FFF',
          padding: '36px',
        }}
      >
        <Input
          style={{
            width: '938px',
            height: '40px',
            margin: '0 auto',
          }}
          placeholder="Type to search..."
          onChange={(e) => this.handleSearchInputChange(e.target.value)}
        />
        {loading && (
          <Spin
            size="large"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{
              width: '300px',
              height: '100px',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}

        {!loading && !error && totalResults === 0 && (
          <Alert
            message="No results found"
            type="info"
            showIcon
            style={{
              width: '300px',
              height: '100px',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}

        {!loading && !error && totalResults > 0 && (
          <>
            <MoviesList moviesData={moviesData} />
            <Pagination
              current={currentPage}
              total={totalResults}
              defaultPageSize={20}
              showSizeChanger={false}
              hideOnSinglePage
              style={{
                margin: '0 auto',
              }}
              onChange={this.handlePageChange}
            />
          </>
        )}
      </main>
    )
  }
}
