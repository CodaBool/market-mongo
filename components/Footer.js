import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

export default function Footer() {
  return (
    <footer>
      <Row style={{ margin: '0px', padding: '0px' }}>
        <Col sm={10} className="mx-auto">
          <hr />
          <p className="text-muted text-center">footer</p>
        </Col>
      </Row>
    </footer>
  )
}
