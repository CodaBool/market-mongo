import { EmojiDizzy } from 'react-bootstrap-icons'
import Image from 'next/image'

export default function BoxImg({ imageUrl, alt, small }) {
  if (small) return ( // used in checkout
    <div className="mx-4 box-small">
      <Image src={imageUrl} alt={alt} layout="responsive" height={200} width={200} quality={20} />
      <div className="mx-4 shine"></div>
    </div>
  )
  if (imageUrl) return ( // used in browse
    <div className="box">
      <Image src={imageUrl} alt={alt} layout="responsive" height={442} width={442} quality={40} />
      <div className="shine"></div>
    </div>
  )
  return ( // used in admin page
    <div className="d-flex box align-items-center justify-content-center flex-column" style={{backgroundColor: 'rgba(255, 0, 0, 0.02)'}}>
      <EmojiDizzy className="mb-4" size={30} />
      <p>Could Not Load Image</p>
      <p>{alt}</p>
    </div>
  )
}