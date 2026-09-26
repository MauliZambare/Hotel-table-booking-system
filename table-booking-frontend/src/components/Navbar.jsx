import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { getStoredUser, removeStoredUser } from '../services/auth.js'

function Navbar() {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => getStoredUser())

  useEffect(() => {
    function updateUser() {
      setUser(getStoredUser())
    }

    window.addEventListener('tablebook-auth-change', updateUser)
    window.addEventListener('storage', updateUser)
    return () => {
      window.removeEventListener('tablebook-auth-change', updateUser)
      window.removeEventListener('storage', updateUser)
    }
  }, [])

  function handleLogout() {
    removeStoredUser()
    navigate('/', { state: { message: 'You have been logged out.' } })
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light site-navbar">
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
          <span className="brand-mark" aria-hidden="true">TB</span>
          <span>TableBook</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <li className="nav-item"><NavLink className="nav-link" to="/">Home</NavLink></li>
            {user?.role === 'ADMIN' ? (
              <>
                <li className="nav-item"><NavLink className="nav-link" to="/admin">Admin Dashboard</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/admin/tables">Manage Tables</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/admin/bookings">Manage Bookings</NavLink></li>
                <li className="nav-item"><span className="nav-link fw-semibold">Welcome, {user.name}</span></li>
                <li className="nav-item ms-lg-2"><button className="btn btn-brand btn-sm px-4" type="button" onClick={handleLogout}>Logout</button></li>
              </>
            ) : user ? (
              <>
                <li className="nav-item"><NavLink className="nav-link" to="/tables">Tables</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/book-table">Book Table</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/my-bookings">My Bookings</NavLink></li>
                <li className="nav-item"><span className="nav-link fw-semibold">Welcome, {user.name}</span></li>
                <li className="nav-item ms-lg-2"><button className="btn btn-brand btn-sm px-4" type="button" onClick={handleLogout}>Logout</button></li>
                <li className="nav-item"><NavLink className="btn btn-outline-brand btn-sm px-3" to="/admin/login">Admin</NavLink></li>
              </>
            ) : (
              <>
                <li className="nav-item"><NavLink className="nav-link" to="/tables">Tables</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/book-table">Book Table</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/my-bookings">My Bookings</NavLink></li>
                <li className="nav-item ms-lg-2"><NavLink className="btn btn-outline-brand btn-sm px-4" to="/login">Login</NavLink></li>
                <li className="nav-item"><NavLink className="btn btn-outline-brand btn-sm px-3" to="/admin/login">Admin</NavLink></li>
                <li className="nav-item"><NavLink className="btn btn-brand btn-sm px-4" to="/register">Register</NavLink></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar