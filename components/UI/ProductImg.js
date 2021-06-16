import { useState } from 'react'
import Image from 'next/image'

export default function ProductImg({ variants, alt, coverImg, variantChange }) {
  const [cover, setCover] = useState(coverImg)

  function handleClick(image, id) {
    setCover(image)
    variantChange(id)
  }

  return (
    <div>
      <Image src={cover} width={150} height={150} layout="responsive" quality={90} alt={alt} />
      <div className="d-flex mt-2" style={{flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'center'}}>
        {variants.map(variant => (
          <span key={variant._id} className="">
            {variant.images.map((image, index) => (
              <Image
                key={index}
                src={image}
                width={75}
                height={75}
                layout="fixed"
                alt={alt}
                quality={40}
                onClick={() => handleClick(image, variant._id)}
                className="variant-selector mx-1"
              />
            ))}
          </span>
        ))}
      </div>
    </div>
  )
}
