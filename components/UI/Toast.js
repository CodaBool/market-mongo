import Toast from 'react-bootstrap/Toast'

export default function ToastCustom({ show, setShow, title, body, error }) {
  return (
    <Toast onClose={() => setShow(false)} show={show} delay={15000} autohide>
      {error ? (
        <Toast.Header>
          <div className="mr-auto">
            <strong>{title}</strong>
          </div>
        </Toast.Header>
      ) : (
        <Toast.Header>
          <div
            className="mr-auto"
            style={{
              backgroundImage: "url('/image/confetti.gif'",
              width: '100%'
            }}
          >
            <strong>{title}</strong>
          </div>
        </Toast.Header>
      )}
      <Toast.Body>{body}</Toast.Body>
    </Toast>
  )
}
