import React from 'react'
import cn from 'classnames'

import Menu from '../Menu'

import * as s from './Footer.module.scss'

const Footer = ({ title }) => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={cn('container', s.footer)}>
      <div className={s.footer__logo}>{title}</div>
      <Menu variant="footer" />
      <div className={s.footer__copy}>
        © {currentYear} {title}. All Rights Reserved
      </div>
    </footer>
  )
}

export default Footer
