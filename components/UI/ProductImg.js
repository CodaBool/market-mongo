import React from 'react'
import Image from 'next/image'

export default function ProductImg({ variants, alt, coverImg }) {

  return (
    <div>
      <Image src={variants[0].images[0]} width={150} height={150} layout="responsive" alt={alt} />
    </div>
  )
}
