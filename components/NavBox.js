import { useRef, useEffect } from 'react'
import useScreen from '../lib/useScreen'

export default function NavBox() {
  let screen = useScreen()
  if (!screen) screen = 'medium'

  const imgHome = useRef(null)
  const imgCode = useRef(null)
  const home = useRef(null)
  const code = useRef(null)

  useEffect(() => {
    imgCode.current.style.height = '0px'
    imgHome.current.style.height = '0px'
  }, [])

  if (home.current && code.current) {
    if (screen.includes('small')) {
      home.current.innerText = 'HOME'
      code.current.innerText = 'CODE'
    } else {
      home.current.innerText = 'GO HOME'
      code.current.innerText = 'SEE CODE'
    }
  }

  function expand(ref) {
    if (screen.includes('small')) {
      // Small, screen width <= 991px
      if (ref.current.id === 'img-code') {
        imgCode.current.style.height = '70%'
      } else {
        imgHome.current.style.height = '100%'
      }
    } else {
      // Large, screen width > 991px
      if (ref.current.id === 'img-code') {
        imgCode.current.style.height = '160%'
      } else {
        imgHome.current.style.height = '160%'
      }
    }
  }

  function contract(ref) {
    if (ref.current.id === 'img-code') {
      imgCode.current.style.height = '0%'
    } else {
      imgHome.current.style.height = '0%'
    }
  }

  // TODO: update href
  return (
    <div className="navBox">
      <img src="/image/navBox-home.png" ref={imgHome} id="img-home" />
      <a
        href="https://codabool.com/projects"
        ref={home}
        className="navBox-btn"
        id="btn-home"
        onMouseEnter={() => expand(imgHome)}
        onMouseLeave={() => contract(imgHome)}
      >
        HOME
      </a>
      <a
        href="https://github.com/CodaBool/nextjs-social-heroku"
        ref={code}
        className="navBox-btn"
        id="btn-code"
        onMouseEnter={() => expand(imgCode)}
        onMouseLeave={() => contract(imgCode)}
      >
        CODE
      </a>
      <img src="/image/navBox-code.png" ref={imgCode} id="img-code" />
    </div>
  )
}
