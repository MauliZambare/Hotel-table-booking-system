import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api, { getApiErrorMessage } from '../services/api.js'
import { storeUser } from '../services/auth.js'

function Login() {
	const [error, setError] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [wasValidated, setWasValidated] = useState(false)
	const location = useLocation()
	const navigate = useNavigate()
	const bookingWarningShown = useRef(false)

	useEffect(() => {
		if (!location.state?.bookingLoginRequired) {
			bookingWarningShown.current = false
			return
		}

		if (!bookingWarningShown.current) {
			bookingWarningShown.current = true
			toast.warning('Please login first to book a table.')
		}
	}, [location.state?.bookingLoginRequired])

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
			const user = {
				id: response.data.id,
				name: response.data.name,
				email: response.data.email,
				phone: response.data.phone,
				role: response.data.role,
			}
			storeUser(user)
				navigate(user.role === 'ADMIN' ? '/admin' : location.state?.from?.pathname ?? '/', {
					replace: true,
					state: { message: 'Login successful.', messageType: 'success' },
				})
		} catch (requestError) {
			setError(getApiErrorMessage(requestError, 'Unable to log in. Please check your email and password.'))
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<section className="page-section auth-section">
			<div className="container py-5">
				<div className="auth-panel mx-auto">
					<p className="eyebrow">Welcome back</p>
					<h1>Sign in.</h1>
					<p className="text-muted mb-4">Sign in to keep your dining plans in one place.</p>
					{location.state?.message && !location.state?.bookingLoginRequired && <div className="alert alert-success" role="status">{location.state.message}</div>}
					{error && <div className="alert alert-danger" role="alert">{error}</div>}
					<form className={wasValidated ? 'was-validated' : ''} onSubmit={handleSubmit} onInvalid={() => setWasValidated(true)} onChange={() => setError('')}>
						<div className="mb-3">
							<label className="form-label" htmlFor="login-email">Email address</label>
							<input className="form-control" id="login-email" name="email" type="email" autoComplete="email" required />
							<div className="invalid-feedback">Enter a valid email address.</div>
						</div>
						<div className="mb-4">
							<label className="form-label" htmlFor="login-password">Password</label>
							<div className="input-group has-validation">
								<input className="form-control" id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required />
								<button className="btn btn-outline-secondary" type="button" aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'Hide' : 'Show'}</button>
								<div className="invalid-feedback">Enter your password.</div>
							</div>
						</div>
						<button className="btn btn-brand btn-lg w-100" type="submit" disabled={submitting}>
							{submitting ? 'Logging in...' : 'Login'}
						</button>
					</form>
					<p className="auth-switch mt-4 mb-0">New to TableBook? <Link to="/register">Create an account</Link></p>
				</div>
			</div>
		</section>
	)
}

export default Login
