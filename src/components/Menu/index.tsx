'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import cn from 'classnames'
import gsap from 'gsap'
import ScrollToPlugin from 'gsap/ScrollToPlugin'

import MENU from './constants'

import s from './Menu.module.scss'

gsap.registerPlugin(ScrollToPlugin)

interface MenuProps {
  variant?: string
}

const Menu = ({ variant }: MenuProps) => {
  const pathname = usePathname()
  const isHomepage = pathname === '/'

  const handleScroll = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    link: string
  ) => {
    e.preventDefault()

    gsap.to(window, { scrollTo: link, ease: 'power2' })
  }

  return (
    <nav className={cn(s.menu, variant && s[`menu--${variant}`])}>
      <ul className={s.menu__list}>
        {MENU.map(({ name, link }) => (
          <li className={s.menu__item} key={name}>
            {isHomepage ? (
              <a
                className={s.menu__link}
                href={link}
                onClick={(e) => handleScroll(e, link)}
              >
                {name}
              </a>
            ) : (
              <Link className={s.menu__link} href={`/${link}`}>
                {name}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Menu
