import React from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'Second Page',
  description: 'Second Page Description',
}

const SecondPage = () => (
  <div className="container">
    <h1>Hi from the second page</h1>
    <p>Welcome to page 2</p>
    <Link href="/">Go back to the homepage</Link>
  </div>
)

export default SecondPage
