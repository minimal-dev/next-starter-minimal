import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

import ogImage from '~img/og-image.png'
import NextLogo from '~img/next-logo.svg?url'
import Logo from '~icons/minimal-logo.svg'

const Home = () => {
  return (
    <main>
      <div className="container">
        <h1>Howdy!</h1>
        <p>Welcome to your new Nextjs site.</p>
        <p>Now go build something great.</p>
        {/* Example of Next Image */}
        <p>
          <Image src={ogImage} width="650" alt="Image" placeholder="blur" />
        </p>
        <p>
          <Image src={NextLogo} alt="Nextjs Logo" />
        </p>
        <p>
          {/* Example of Icons usage  */}
          <Logo width={60} height={60} />
        </p>
        <p>
          <Link href="/page-2">Go to page 2</Link> <br />
        </p>
      </div>
    </main>
  )
}

export default Home
