import { useEffect, useState } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import Button from 'react-bootstrap/Button'
import Toast from '../../components/UI/Toast'
import { ArrowClockwise, ArrowLeft, PlusSquare } from 'react-bootstrap-icons'

export default function Images() {
  const [images, setImages] = useState()
  const [flip, setFlip] = useState(false)
  const [show, setShow] = useState(false)
  const [filter, setFilter] = useState('Last Month')
  const [showForm, setShowForm] = useState()
  const { handleSubmit, formState:{ errors }, register } = useForm()

  useEffect(() => {
    getImages()
  }, [])

  useEffect(() =>  {
    setFlip(true)
    setTimeout(() => setFlip(false), 1000)
  }, [images])

  function getImages() {
    axios.get('api/stripe/file', { params: { filter }})
      .then(res => setImages(res.data))
      .catch(err => console.log(err.response.data.msg))
  }

  async function onSubmit(data) {
    const formData = new FormData()
    formData.append('name', data.name);
    formData.append("image", data.image[0])
    console.log('formData', formData)
    axios.post('/api/stripe/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  function copyURL(url) {
    navigator.clipboard.writeText(url)
    setShow(true)
  }

  return (
    <>
      {!showForm &&
        <>
          <h1 className="display-4">
            Images 
            <ArrowClockwise size={26} className={`${flip && 'flip'} sway-on-hover ml-3`} onClick={getImages} fill="#0069d9" />
            <PlusSquare className="spin-on-hover ml-3" size={26} fill="#0069d9" onClick={() => setShowForm(true)} />
          </h1>
          <select className="form-control my-2" onChange={e => setFilter(e.target.value)}>
            {['Last Month', 'Last 6 Months', 'Last Year', 'All'].map((option, index) => <option key={index}>{option}</option>)}
          </select>
          {images?.length > 0 && images.map(image => (
            <img key={image} src={image} width="150px" height="150px" className="m-2" onClick={() => copyURL(image)} style={{cursor: 'pointer'}} />
          ))}
        </>
      }
      {showForm &&
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
          <Button variant="light" className="rounded-circle mb-5 border" onClick={() => setShowForm()} style={{width: '3rem', height: '3rem'}}>
            <ArrowLeft className="mb-1" size={18} />
          </Button>
          <div className="in-group">
            <input 
              className="material"
              type="text"
              {...register("name", { required: true })}
              defaultValue=""
              required
            />
            <span className="bar"></span>
            <label className="in-label">Name</label>
          </div>
          <input type="file" {...register("image")} required />
          <hr />
          <Button variant="outline-primary" type="submit">
            Submit
          </Button>
        </form>
      }
      <div className="toastHolder" style={{position: 'fixed', top: '10%', right: '10%'}}>
        <Toast show={!!show} setShow={setShow} title='URL Copied' body={<p><strong>The URL for that image has been added to your clipboard</strong></p>} />
      </div>
    </>
  )
}