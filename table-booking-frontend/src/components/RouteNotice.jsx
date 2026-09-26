import { useLocation, useNavigate } from 'react-router-dom'

function RouteNotice() {
  const location = useLocation()
  const navigate = useNavigate()
  const message = location.state?.message

  if (!message) return null

  const variant = location.state?.messageType === 'success' ? 'success' : 'info'

  return (
    <div className="container pt-3">
      <div className={`alert alert-${variant} alert-dismissible fade show`} role="status">
        {message}
        <button
          className="btn-close"
          type="button"
          aria-label="Dismiss message"
          onClick={() => navigate(location.pathname, { replace: true, state: null })}
        ></button>
      </div>
    </div>
  )
}

export default RouteNotice