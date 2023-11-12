// MovieCard.jsx

import React from 'react'
import { Card, Tag, Rate } from 'antd'
import { format, parseISO } from 'date-fns'
import PropTypes from 'prop-types'
import './movie-card.css'

const getRatingColor = (rating) => {
  if (rating >= 7) {
    return '#66E900'
  }
  if (rating >= 5) {
    return '#E9D100'
  }
  if (rating >= 3) {
    return '#E97E00'
  }
  return '#E90000'
}

function textCutter(text, maxLength) {
  if (text.length <= maxLength) {
    return text
  }
  const truncatedText = text.substr(0, maxLength)
  const lastSpaceIndex = truncatedText.lastIndexOf(' ')
  if (lastSpaceIndex !== -1) {
    return `${truncatedText.substr(0, lastSpaceIndex)}...`
  }
  return `${truncatedText}...`
}

function MovieCard({ movie, genres, appMode, ratedMovies, saveRatedMovie, guestSessionId, deviceType, moviesService }) {
  const cardHeight = deviceType === 'mobile' ? '245px' : '279px'
  const titleLength = deviceType === 'mobile' ? 30 : 20
  const overviewLength = deviceType === 'mobile' ? 240 : 210

  return (
    <Card
      hoverable
      className="movies-list__movie-card movie-card"
      bodyStyle={{ padding: '0', display: 'flex', wrap: 'nowrap', height: `${cardHeight}` }}
    >
      <img
        className="movie-card__poster"
        alt={movie.original_title}
        src={
          movie.poster_path
            ? `https://image.tmdb.org/t/p/original${movie.poster_path}`
            : `https://via.placeholder.com/240x360.png?text=${movie.title}`
        }
      />

      <div className="movie-card__content">
        <div className="movie-card__first-line">
          <h2 className="movie-card__title">{textCutter(movie.original_title, titleLength)}</h2>
          {movie.original_title.length >= titleLength && (
            <span className="movie-card__title--full">{movie.original_title}</span>
          )}
          <div className="movie-card__rating-box">
            <div
              className="movie-card__rating-indicator"
              style={{
                border: `2px solid ${getRatingColor(movie.vote_average)}`,
              }}
            >
              <span className="movie-card__rating">{movie.vote_average.toFixed(1)}</span>
            </div>
          </div>
        </div>
        {movie.release_date ? (
          <p className="movie-card__release-date">{format(parseISO(movie.release_date), 'MMMM d, yyyy')}</p>
        ) : null}

        <div className="movie-card__genres-container">
          {movie.genre_ids.map((genre) => {
            const foundGenre = genres.find((g) => g.id === genre)
            return foundGenre ? (
              <Tag className="movie-card__genre-tag" key={genre}>
                {foundGenre.name}
              </Tag>
            ) : null
          })}
        </div>

        <div className="movie-card__overview-wrapper">
          <p className="movie-card__overview">{textCutter(movie.overview, overviewLength)}</p>
          {movie.overview.length >= overviewLength && (
            <span className="movie-card__overview--full">{movie.overview}</span>
          )}
        </div>

        <Rate
          className="movie-card__rate"
          allowHalf
          count={10}
          defaultValue={
            appMode === 'search' && ratedMovies && ratedMovies[movie.id] ? ratedMovies[movie.id] : movie.rating
          }
          onChange={async (value) => {
            await moviesService.rateMovie(movie.id, value, guestSessionId)
            await saveRatedMovie(movie.id, value, movie)
          }}
        />
      </div>
    </Card>
  )
}

MovieCard.defaultProps = {
  appMode: '',
  ratedMovies: {},
  saveRatedMovie: () => {},
  guestSessionId: '',
}

MovieCard.propTypes = {
  appMode: PropTypes.string,
  ratedMovies: PropTypes.objectOf(PropTypes.number),
  saveRatedMovie: PropTypes.func,
  guestSessionId: PropTypes.string,
}

export default MovieCard
