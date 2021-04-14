import React from 'react'
import Pagination from 'react-bootstrap/Pagination'
import Nav from 'react-bootstrap/Nav'
import Row from 'react-bootstrap/Row'

export default function PageNav({ page, totalPages}) {
  let pagesLeft = totalPages - page
  let optionStart, optionEnd

  if (page > 3) {
    optionStart = page - 3
  } else {
    optionStart = 1
  }
  if (pagesLeft > 5) {
    optionEnd = Number(page) + 5
  } else {
    optionEnd = totalPages
  }

  let items = []
  for (let i = optionStart; i <= optionEnd; i++) {
    if (i == page) { // the active page
      items.push(
        <Pagination.Item key={i} active>
          {i}
        </Pagination.Item>
      )
    } else { // non-active pages, with working hrefs
      items.push(
        <Pagination.Item key={i} href={`/browse/${i}`}>
          {i}
        </Pagination.Item>
      )
    }
  }

  return (
    <Row>
      <Nav aria-label="Page navigation" className="mx-auto">
        <Pagination size="lg">
          {page > 4 &&
            <>
              <Pagination.Item key={1}>
                {1}
              </Pagination.Item>
              <Pagination.Ellipsis disabled/>
            </>
          }
          <Pagination>{items}</Pagination>
          {pagesLeft > 4 &&
            <>
              <Pagination.Ellipsis disabled />
              <Pagination.Item key={totalPages}>
                {totalPages}
              </Pagination.Item>
            </>
          }
        </Pagination>
      </Nav>
    </Row>
  )
}
