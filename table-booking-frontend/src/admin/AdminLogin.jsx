import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { getApiErrorMessage } from '../services/api.js'
import { storeUser } from '../services/auth.js'

function AdminLogin() {
	const [error, setError] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const navigate = useNavigate()

	async function handleSubmit(event) {
		event.preventDefault()
		const formData = new FormData(event.currentTarget)
		setSubmitting(true)
		setError('')

		try {
			const response = await api.post('/users/login', {
				email: formData.get('email').trim(),
				password: formData.get('password'),
			})
			if (response.data.role !== 'ADMIN') {
				setError('You are not authorized as an administrator.')
				return
			}

			storeUser({
				id: response.data.id,
				name: response.data.name,
				email: response.data.email,
				phone: response.data.phone,
				role: response.data.role,
			})
			navigate('/admin', { replace: true })
		} catch (requestError) {
			setError(getApiErrorMessage(requestError, 'Unable to log in. Please check your email and password.'))
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<section className="page-section auth-section">
			<div className="container py-5">
				<div className="row justify-content-center">
					<div className="col-12 col-md-8 col-lg-5">
						<div className="card border-0 shadow-sm">
							<div className="card-body p-4 p-md-5">
								<p className="eyebrow">Administrator access</p>
								<h1 className="h2 mb-4">Admin Login</h1>
								{error && <div className="alert alert-danger" role="alert">{error}</div>}
								<form onSubmit={handleSubmit} onChange={() => setError('')}>
									<div className="mb-3">
										<label className="form-label" htmlFor="admin-login-email">Email</label>
										<input className="form-control" id="admin-login-email" name="email" type="email" autoComplete="email" required />
									</div>
									<div className="mb-4">
										<label className="form-label" htmlFor="admin-login-password">Password</label>
										<input className="form-control" id="admin-login-password" name="password" type="password" autoComplete="current-password" required />
									</div>
									<button className="btn btn-brand w-100" type="submit" disabled={submitting}>
										{submitting ? 'Logging in...' : 'Admin Login'}
									</button>
								</form>
								<p className="auth-switch mt-4 mb-0"><Link to="/login">Back to Customer Login</Link></p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

export default AdminLogin