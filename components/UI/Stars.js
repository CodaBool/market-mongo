import { useState, useEffect } from 'react'

export default function Stars({ rating, setRating }) {
  const [hoverRating, setHoverRating] = useState(0)

  useEffect(() => {
    if (rating === 0 && hoverRating !== 0) {
      console.log('noticed rating reset, reseting hover too')
      setHoverRating(0)
    }
  }, [rating])

  function getBrightness(index) {
    if (index < rating) {
      return 'full-lit-star'
    }
    if (index < hoverRating) {
      return 'semi-lit-star'
    }
    return 'unlit-star' // this class has no attributes, it should be removed
  }

  const stars = Array.from({ length: 5 }).map((value, index) => {
    return (
      <span
        key={index}
        className={`${getBrightness(index)} star`}
        onClick={() => setRating(index + 1)}
        onMouseOver={() => setHoverRating(index + 1)}
        onMouseOut={() => setHoverRating(rating)}
      >
        ★
      </span>
    )
  })

  return (
    <div>
      {stars}
    </div>
  )
}

export function StarSimple({ value }) {
  function getBrightness(index) {
    if (index < value) {
      return 'full-lit-star'
    }
    return 'unlit-star' // this class has no attributes, it should be removed
  }

  const stars = Array.from({ length: 5 }).map((val, index) => {
    return (
      <span
        key={index}
        className={`${getBrightness(index)} star-small`}
      >
        ★
      </span>
    )
  })

  return (
    <div className="ml-3 my-2">
      {stars}
    </div>
  )
}
