'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Nav } from 'react-bootstrap'
import cn from 'classnames'
import gsap from 'gsap'
import ScrollToPlugin from 'gsap/ScrollToPlugin'

import MENU from './constants'

gsap.registerPlugin(ScrollToPlugin)

interface MenuProps {
  variant?: string
}

const Menu = ({ variant }: MenuProps) => {
  const pathname = usePathname()
  const isHomepage = pathname === '/'

  const handleScroll = (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    link: string
  ) => {
    e.preventDefault()

    gsap.to(window, { scrollTo: link, ease: 'power2' })
  }

  return (
    <Nav className={cn({ [`nav--${variant}`]: variant })} as="ul">
      {MENU.map(({ name, link }) => (
        <Nav.Item as="li" key={name}>
          {isHomepage ? (
            <Nav.Link href={link} onClick={(e) => handleScroll(e, link)}>
              {name}
            </Nav.Link>
          ) : (
            <Nav.Link as={Link} href={`/${link}`}>
              {name}
            </Nav.Link>
          )}
        </Nav.Item>
      ))}
    </Nav>
  )
}

export default Menu
