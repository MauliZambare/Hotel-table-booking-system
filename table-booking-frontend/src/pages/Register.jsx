import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { getApiErrorMessage } from '../services/api.js'

function Register() {
	const [error, setError] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [wasValidated, setWasValidated] = useState(false)
	const navigate = useNavigate()

	async function handleSubmit(event) {
		event.preventDefault()
		const form = event.currentTarget
		const formData = new FormData(form)
		if (formData.get('password') !== formData.get('confirmPassword')) {
			setError('Those passwords do not match. Please check and try again.')
			return
		}

		setSubmitting(true)
		setError('')
		try {
			await api.post('/users/register', {
				name: formData.get('name').trim(),
				email: formData.get('email').trim(),
				phone: formData.get('phone').trim(),
				password: formData.get('password'),
				role: 'CUSTOMER',
			})
			navigate('/login', {
				replace: true,
				state: { message: 'Registration successful. Please log in with your new account.', messageType: 'success' },
			})
		} catch (requestError) {
			setError(getApiErrorMessage(requestError, 'Unable to create your account. Please check your details and try again.'))
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<section className="page-section auth-section">
			<div className="container py-5">
				<div className="auth-panel mx-auto">
					<p className="eyebrow">Join us</p>
					<h1>Create an account.</h1>
					<p className="text-muted mb-4">Keep your reservations close and your next meal even closer.</p>
					{error && <div className="alert alert-danger" role="alert">{error}</div>}
					<form className={wasValidated ? 'was-validated' : ''} onSubmit={handleSubmit} onInvalid={() => setWasValidated(true)} onChange={() => setError('')}>
						<div className="mb-3">
							<label className="form-label" htmlFor="register-name">Full name</label>
							<input className="form-control" id="register-name" name="name" autoComplete="name" required />
							<div className="invalid-feedback">Enter your full name.</div>
						</div>
						<div className="mb-3">
							<label className="form-label" htmlFor="register-email">Email address</label>
							<input className="form-control" id="register-email" name="email" type="email" autoComplete="email" required />
							<div className="invalid-feedback">Enter a valid email address.</div>
						</div>
						<div className="mb-3">
							<label className="form-label" htmlFor="register-mobile">Mobile number</label>
							<input className="form-control" id="register-mobile" name="phone" type="tel" autoComplete="tel" pattern={'(?:[0-9]|\\+|\\(|\\)| |-){7,30}'} required />
							<div className="invalid-feedback">Enter a valid phone number.</div>
						</div>
						<div className="mb-3">
							<label className="form-label" htmlFor="register-password">Password</label>
							<div className="input-group has-validation">
								<input className="form-control" id="register-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength="8" required />
								<button className="btn btn-outline-secondary" type="button" aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'Hide' : 'Show'}</button>
								<div className="invalid-feedback">Use at least 8 characters.</div>
							</div>
						</div>
						<div className="mb-4">
							<label className="form-label" htmlFor="confirm-password">Confirm password</label>
							<div className="input-group has-validation">
								<input className="form-control" id="confirm-password" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" minLength="8" required />
								<button className="btn btn-outline-secondary" type="button" aria-pressed={showConfirmPassword} onClick={() => setShowConfirmPassword((visible) => !visible)}>{showConfirmPassword ? 'Hide' : 'Show'}</button>
								<div className="invalid-feedback">Confirm your password.</div>
							</div>
						</div>
						<button className="btn btn-brand btn-lg w-100" type="submit" disabled={submitting}>
							{submitting ? 'Creating account...' : 'Register'}
						</button>
					</form>
					<p className="auth-switch mt-4 mb-0">Already registered? <Link to="/login">Login</Link></p>
				</div>
			</div>
		</section>
	)
}

export default Register
