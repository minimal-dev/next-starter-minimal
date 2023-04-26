import React from 'react'
import cn from 'classnames'

import Menu from '../Menu'

import * as s from './Header.module.scss'

const Header = ({ title }) => (
  <header className={cn('container', s.header)}>
    <div className={s.header__logo}>{title}</div>
    <Menu />
  </header>
)

export default Header
