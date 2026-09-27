import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import api, { getApiErrorMessage } from '../services/api.js'
import { getStoredUser } from '../services/auth.js'

function BookTable() {
	const user = getStoredUser()
	const navigate = useNavigate()
	const [tables, setTables] = useState([])
	const [loadingTables, setLoadingTables] = useState(true)
	const [submitting, setSubmitting] = useState(false)
	const [tableError, setTableError] = useState('')
	const [wasValidated, setWasValidated] = useState(false)
	const [reloadKey, setReloadKey] = useState(0)
	const validationToastShown = useRef(false)

	useEffect(() => {
		let isCurrent = true

		async function loadTables() {
			setLoadingTables(true)
			setTableError('')
			try {
				const response = await api.get('/tables')
				if (isCurrent) setTables(response.data)
			} catch (requestError) {
				if (isCurrent) setTableError(getApiErrorMessage(requestError, 'Unable to load available tables. Please try again.'))
			} finally {
				if (isCurrent) setLoadingTables(false)
			}
		}

		loadTables()
		return () => { isCurrent = false }
	}, [reloadKey])

	async function handleSubmit(event) {
		event.preventDefault()
		if (submitting) return
		setSubmitting(true)

		const form = event.currentTarget
		const formData = new FormData(form)
		const bookingRequest = {
			customerName: formData.get('customerName'),
			phone: formData.get('phone'),
			email: formData.get('email'),
			bookingDate: formData.get('bookingDate'),
			bookingTime: formData.get('bookingTime'),
			numberOfPeople: Number(formData.get('numberOfPeople')),
			tableId: Number(formData.get('tableId')),
		}

		try {
			await api.post('/bookings', bookingRequest)
			await Swal.fire({
				icon: 'success',
				title: 'Booking Successful!',
				text: 'Your table has been booked successfully.',
				confirmButtonText: 'OK',
			})
			navigate('/my-bookings')
		} catch (requestError) {
			const status = requestError?.response?.status
			const fallbackMessage = status === 400
				? 'Please fill all required fields.'
				: status === 404
					? 'The selected table or booking could not be found.'
					: status === 409
						? 'This table is already booked for the selected date and time.'
						: 'Failed to book table. Please try again.'
			const message = getApiErrorMessage(requestError, fallbackMessage)
			if (status === 400) toast.warning(message)
			else toast.error(message)
		} finally {
			setSubmitting(false)
		}
	}

	function handleInvalid() {
		setWasValidated(true)
		if (!validationToastShown.current) {
			toast.warning('Please fill all required fields.')
			validationToastShown.current = true
		}
	}

	return (
		<section className="page-section">
			<div className="container py-5">
				<div className="form-layout row g-5 justify-content-between">
					<div className="col-lg-4">
						<p className="eyebrow">Make it a date</p>
						<h1>Book your table.</h1>
						<p className="text-muted">Tell us when you are coming and we will have a place ready for you.</p>
						<div className="booking-aside mt-4">
							<strong>Planning for a larger group?</strong>
							<span>Give us a call at <a href="tel:+15550142800">+1 (555) 014-2800</a> and we will help arrange it.</span>
						</div>
					</div>
					<div className="col-lg-7">
						<div className="form-panel">
							{loadingTables && (
								<div className="d-flex align-items-center gap-2 mb-3" role="status">
									<span className="spinner-border spinner-border-sm text-danger" aria-hidden="true"></span>
									<span>Loading available tables...</span>
								</div>
							)}
							{tableError && (
								<div className="alert alert-danger d-flex align-items-center justify-content-between gap-3" role="alert">
									<span>{tableError}</span>
									<button className="btn btn-sm btn-outline-danger flex-shrink-0" type="button" onClick={() => setReloadKey((key) => key + 1)}>Try again</button>
								</div>
							)}
							{!loadingTables && !tableError && tables.length === 0 && (
								<div className="alert alert-warning" role="status">There are no available tables right now.</div>
							)}
							<form className={wasValidated ? 'was-validated' : ''} onSubmit={handleSubmit} onInvalid={handleInvalid} onChange={() => { validationToastShown.current = false }}>
								<div className="row g-3">
									<div className="col-md-6">
										<label className="form-label" htmlFor="customer-name">Customer name</label>
										<input className="form-control" id="customer-name" name="customerName" autoComplete="name" defaultValue={user?.name ?? ''} required />
										<div className="invalid-feedback">Enter the customer name.</div>
									</div>
									<div className="col-md-6">
										<label className="form-label" htmlFor="mobile">Mobile number</label>
										<input className="form-control" id="mobile" name="phone" type="tel" autoComplete="tel" pattern={'(?:[0-9]|\\+|\\(|\\)| |-){7,30}'} defaultValue={user?.phone ?? ''} required />
										<div className="invalid-feedback">Enter a valid phone number.</div>
									</div>
									<div className="col-12">
										<label className="form-label" htmlFor="booking-email">Email address</label>
										<input className="form-control" id="booking-email" name="email" type="email" autoComplete="email" defaultValue={user?.email ?? ''} required />
										<div className="invalid-feedback">Enter a valid email address.</div>
									</div>
									<div className="col-md-6">
										<label className="form-label" htmlFor="booking-date">Booking date</label>
										<input className="form-control" id="booking-date" name="bookingDate" type="date" min={new Date().toLocaleDateString('en-CA')} required />
										<div className="invalid-feedback">Choose today or a future date.</div>
									</div>
									<div className="col-md-6">
										<label className="form-label" htmlFor="booking-time">Booking time</label>
										<input className="form-control" id="booking-time" name="bookingTime" type="time" min="11:00" max="22:00" required />
										<div className="invalid-feedback">Choose a booking time.</div>
									</div>
									<div className="col-md-6">
										<label className="form-label" htmlFor="people">Number of people</label>
										<select className="form-select" id="people" name="numberOfPeople" defaultValue="" required>
											<option value="" disabled>Select party size</option>
											{[1, 2, 3, 4, 5, 6].map((count) => <option value={count} key={count}>{count} {count === 1 ? 'person' : 'people'}</option>)}
										</select>
										<div className="invalid-feedback">Choose the number of people.</div>
									</div>
									<div className="col-md-6">
										<label className="form-label" htmlFor="table">Select table</label>
										<select className="form-select" id="table" name="tableId" defaultValue="" required disabled={loadingTables || tables.length === 0}>
											<option value="" disabled>Choose an available table</option>
											{tables.map((table) => <option value={table.id} key={table.id}>Table {table.tableNumber} · {table.capacity} seats</option>)}
										</select>
										<div className="invalid-feedback">Select a table.</div>
									</div>
									<div className="col-12 pt-2">
										<button className="btn btn-brand btn-lg w-100" type="submit" disabled={loadingTables || tables.length === 0 || submitting}>
											{submitting && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>}
											{submitting ? 'Booking...' : 'Confirm booking'}
										</button>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

export default BookTable
