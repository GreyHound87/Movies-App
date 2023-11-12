import React from 'react'
import PropTypes from 'prop-types'
import { List } from 'antd'

import { MoviesServiceConsumer } from '../movies-context/movies-context'
import MovieCard from '../movie-card/movie-card'
import './movies-list.css'

function MoviesList({ moviesData, guestSessionId, saveRatedMovie, deviceType }) {
  return (
    <List
      className="movies-app__movies-list movies-list"
      grid={{
        column: 2,
        gutter: 32,
        xs: 1,
        sm: 1,
        md: 1,
        lg: 2,
        xl: 2,
        xxl: 2,
      }}
      dataSource={moviesData}
      renderItem={(movie) => (
        <MoviesServiceConsumer>
          {({ moviesService, genres, appMode, ratedMovies }) => (
            <List.Item className="movies-list__item">
              <MovieCard
                movie={movie}
                genres={genres}
                appMode={appMode}
                ratedMovies={ratedMovies}
                saveRatedMovie={saveRatedMovie}
                guestSessionId={guestSessionId}
                deviceType={deviceType}
                moviesService={moviesService}
              />
            </List.Item>
          )}
        </MoviesServiceConsumer>
      )}
    />
  )
}

MoviesList.defaultProps = {
  moviesData: [],
  guestSessionId: '',
  saveRatedMovie: () => {},
}

MoviesList.propTypes = {
  moviesData: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  guestSessionId: PropTypes.string,
  saveRatedMovie: PropTypes.func,
}

export default MoviesList
