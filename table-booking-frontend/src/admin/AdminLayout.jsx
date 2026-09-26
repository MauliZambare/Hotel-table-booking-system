import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import RouteNotice from '../components/RouteNotice.jsx'
import { removeStoredUser } from '../services/auth.js'

function AdminLayout() {
  const navigate = useNavigate()

  function handleLogout() {
    removeStoredUser()
    navigate('/', { state: { message: 'You have been logged out.' } })
  }

  return (
    <div className="admin-shell">
      <nav className="navbar navbar-expand-lg admin-navbar">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/admin">TableBook <span>ADMIN</span></Link>
          <button
            className="navbar-toggler navbar-dark"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#adminNavigation"
            aria-controls="adminNavigation"
            aria-expanded="false"
            aria-label="Toggle admin navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="adminNavigation">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
              <li className="nav-item"><NavLink end className="nav-link" to="/admin">Dashboard</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/admin/tables">Manage Tables</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/admin/bookings">Manage Bookings</NavLink></li>
              <li className="nav-item ms-lg-2"><button className="btn btn-sm btn-outline-light px-3" type="button" onClick={handleLogout}>Logout</button></li>
            </ul>
          </div>
        </div>
      </nav>
      <main className="admin-main">
        <RouteNotice />
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout