export default function BoxImg({ product, cartDetails, item }) {
  const error = <p className="img-lg">Could Not Load Image</p>
  if (cartDetails && item) {
    if (cartDetails[item]) {
      if (cartDetails[item].image) return (
        <>
          {cartDetails[item].image 
            ? <img src={cartDetails[item].image} alt={cartDetails[item].name} className="mx-auto d-block rounded" style={{width: '70%'}} />
            : <div className="border p-4" style={{width: '150px', height: '150px'}}>No Image Added 😔</div>
          }
        </>
      )
    }
  }
  if (product) {
    if (product.images) {
      if (product.images[0]) return (
        <div className="d-flex box">
          {product.images[0]
            ? <img src={product.images[0]} alt={product.name} />
            : error
          }
          <div className="shine"></div>
        </div>
      )
    }
  }
  return error
}