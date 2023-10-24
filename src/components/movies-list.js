import React from 'react'
import { List, Card, Tag, Rate } from 'antd'
import { format, parseISO } from 'date-fns'

function MoviesList({ moviesData }) {
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

  return (
    <List
      grid={{
        column: 2,
        gutter: 24,
        xs: 1,
        sm: 1,
        md: 1,
        lg: 2,
        xl: 2,
        xxl: 2,
      }}
      style={{
        width: '1010px',
        margin: '0 auto',
        padding: '20px 40px 20px 40px',
      }}
      dataSource={moviesData}
      renderItem={(movie) => (
        <List.Item>
          <Card
            hoverable
            style={{ width: '454px', height: '279px', overflow: 'hidden', marginBottom: '38px' }}
            bodyStyle={{ padding: '0', display: 'flex', wrap: 'nowrap' }}
          >
            <img
              style={{
                width: '40%',
                height: '279px',
                objectFit: 'cover',
              }}
              alt={movie.original_title}
              src={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/original${movie.poster_path}`
                  : `https://via.placeholder.com/240x360.png?text=${movie.title}`
              }
            />

            <div
              style={{
                width: '60%',
                height: '100%',
                padding: '8px 9px 2px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                flexWrap: 'nowrap',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                <h2
                  style={{
                    margin: '0',
                    marginBottom: '7px',
                    padding: '0',
                    /* fontFamily: 'Inter UI', */
                    fontSize: '20px',
                    /* fontStyle: 'normal', */
                    fontWeight: 400,
                    lineHeight: '28px',
                  }}
                >
                  {textCutter(movie.original_title, 20)}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #E9D100',
                      borderRadius: '50%',
                      marginRight: '8px',
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 400, color: '#000' }}>
                      {movie.vote_average.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
              {movie.release_date ? (
                <p
                  style={{
                    margin: '0',
                    padding: '0',
                    color: '#827E7E',
                    fontSize: '12px',
                    fontWeight: 400,
                    lineHeight: '22px',
                  }}
                >
                  {format(parseISO(movie.release_date), 'MMMM d, yyyy')}
                </p>
              ) : null}

              <div
                style={{
                  maxHeight: '28px',
                  margin: '0',
                  marginBottom: '9px',
                  padding: '0',
                  color: 'rgba(0, 0, 0, 0.65)',
                  /* fontFamily: 'Inter UI', */
                  fontSize: '12px',
                  /* fontStyle: 'normal', */
                  fontWeight: 400,
                  lineHeight: '22px',
                  overflow: 'auto',
                }}
              >
                {movie.genre_ids.map((genre) => (
                  <Tag
                    style={{
                      width: '46px',
                      height: '20px',
                      color: 'rgba(0, 0, 0, 0.65)',
                      fontSize: '12px',
                      fontWeight: 400,
                      marginBottom: '7px',
                    }}
                    key={genre}
                  >
                    {genre}
                  </Tag>
                ))}
              </div>
              <p
                style={{
                  height: '129px',
                  margin: '0',
                  marginBottom: '1px',
                  color: '#000',
                  /* fontFamily: 'Inter UI', */
                  fontSize: '12px',
                  /* fontStyle: 'normal', */
                  fontWeight: 400,
                  lineHeight: '22px',
                }}
              >
                {textCutter(movie.overview, 200)}
              </p>
              <Rate
                allowHalf
                count={10}
                style={{
                  margin: '0',
                  padding: '0',
                  fontSize: '16px',
                }}
              />
            </div>
          </Card>
        </List.Item>
      )}
    />
  )
}

export default MoviesList
