import Spinner from 'react-bootstrap/Spinner'
import { signIn } from 'coda-auth/client'

// conditionally display a small or large loading spinner & message
// the message will fade in after 2 seconds
export const Load = ({ msg, small }) => {
  return (
    <>
      <Spinner
        animation="border"
        variant="info"
        style={{display: 'block', margin: `${small ? '5%' : '20%'} auto 0 auto`}}
        size={`${small ? '' : ''}`}
      />
      <h4 
        className={`${small ? 'm-2': 'm-5'} text-center`} 
        style={{ animation: 'fadein 2s', fontSize: `${small ? '1.2em' : '2em'}` }}
      >
        {msg}
      </h4>
    </>
  )
}

export function isLoad(session, loading, required) {
  if (loading) return true
  if (session === null && !loading && required) { signIn(); return true }
  return false
}
