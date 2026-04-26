import React from 'react'
import cn from 'classnames'

import Menu from '../Menu'

import s from './Header.module.scss'

interface HeaderProps {
  title: string
}

const Header = ({ title }: HeaderProps) => (
  <header className={cn('container', s.header)}>
    <div className={s.header__logo}>{title}</div>
    <Menu />
  </header>
)

export default Header
