import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { CompassIcon, MenuIcon, HeartIcon, ShieldIcon, LogOutIcon, XIcon } from '../icons'

export default function Navbar() {
  const { user, token, isAdmin, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const close = () => setOpen(false)

  const handleLogout = () => {
    logout()
    close()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="nav-inner">
        <NavLink to="/" className="brand" onClick={close}>
          <span className="brand-mark">
            <CompassIcon size={18} />
          </span>
          <span>Jaatra</span>
        </NavLink>

        <button className="icon-btn menu-btn" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <XIcon /> : <MenuIcon />}
        </button>

        <nav className={`nav-links${open ? ' open' : ''}`}>
          {token && (
            <NavLink to="/wishlist" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={close}>
              <HeartIcon size={16} /> Wishlist
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={close}>
              <ShieldIcon size={16} /> Admin
            </NavLink>
          )}
          {token ? (
            <>
              <NavLink to="/profile" className="nav-user" onClick={close}>
                {user?.name}
              </NavLink>
              <button className="btn ghost small" onClick={handleLogout}>
                <LogOutIcon size={15} /> Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn ghost small" onClick={close}>
                Log in
              </NavLink>
              <NavLink to="/register" className="btn primary small" onClick={close}>
                Sign up
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}