import { useEffect, useState } from 'react'
import api, { getApiErrorMessage } from '../services/api.js'
import { getStoredUser } from '../services/auth.js'

function MyBookings() {
	const userEmail = getStoredUser()?.email?.toLowerCase() ?? ''
	const [bookings, setBookings] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [reloadKey, setReloadKey] = useState(0)

	useEffect(() => {
		let isCurrent = true

		async function loadBookings() {
			setLoading(true)
			setError('')
			try {
				const response = await api.get('/bookings')
				if (isCurrent) {
					setBookings(response.data.filter((booking) => booking.email?.toLowerCase() === userEmail))
				}
			} catch (requestError) {
				if (isCurrent) setError(getApiErrorMessage(requestError, 'Unable to load bookings. Please try again.'))
			} finally {
				if (isCurrent) setLoading(false)
			}
		}

		loadBookings()
		return () => { isCurrent = false }
	}, [reloadKey, userEmail])

	const statusClass = {
		PENDING: 'text-bg-warning',
		CONFIRMED: 'text-bg-success',
		CANCELLED: 'text-bg-danger',
	}

	return (
		<section className="page-section">
			<div className="container py-5">
				<div className="page-heading mb-4">
					<p className="eyebrow">Your plans</p>
					<h1>My bookings.</h1>
					<p className="text-muted mb-0">A quick look at your upcoming restaurant visits.</p>
				</div>
				{error && (
					<div className="alert alert-danger d-flex align-items-center justify-content-between gap-3" role="alert">
						<span>{error}</span>
						<button className="btn btn-sm btn-outline-danger flex-shrink-0" type="button" onClick={() => setReloadKey((key) => key + 1)}>Try again</button>
					</div>
				)}
				{loading && (
					<div className="d-flex align-items-center gap-2 py-4" role="status">
						<span className="spinner-border spinner-border-sm text-danger" aria-hidden="true"></span>
						<span>Loading bookings...</span>
					</div>
				)}
				{!loading && !error && bookings.length === 0 && (
					<div className="alert alert-info" role="status">No bookings found for your account yet.</div>
				)}
				{!loading && !error && bookings.length > 0 && (
					<>
						<div className="table-responsive booking-table-wrap d-none d-md-block">
					<table className="table align-middle mb-0">
						<thead>
							<tr><th scope="col">Booking ID</th><th scope="col">Customer</th><th scope="col">Table</th><th scope="col">Date</th><th scope="col">Time</th><th scope="col">People</th><th scope="col">Status</th></tr>
						</thead>
						<tbody>
							{bookings.map((booking) => (
								<tr key={booking.id}>
									<th scope="row">{booking.id}</th>
									<td>{booking.customerName}</td>
									<td>Table {booking.tableNumber}</td>
									<td>{booking.bookingDate}</td>
									<td>{String(booking.bookingTime).slice(0, 5)}</td>
									<td>{booking.numberOfPeople}</td>
									<td><span className={`badge ${statusClass[booking.status] ?? 'text-bg-secondary'}`}>{booking.status}</span></td>
								</tr>
							))}
						</tbody>
					</table>
						</div>
						<div className="booking-cards d-md-none">
							{bookings.map((booking) => (
								<article className="card booking-mobile-card mb-3" key={booking.id}>
									<div className="card-body">
										<div className="d-flex align-items-start justify-content-between gap-3 mb-3">
											<h2 className="h6 mb-0">Booking #{booking.id}</h2>
											<BookingStatusBadge status={booking.status} />
										</div>
										<dl className="row booking-mobile-details mb-0">
											<dt className="col-5">Customer</dt><dd className="col-7">{booking.customerName}</dd>
											<dt className="col-5">Table</dt><dd className="col-7">Table {booking.tableNumber}</dd>
											<dt className="col-5">Date</dt><dd className="col-7">{booking.bookingDate}</dd>
											<dt className="col-5">Time</dt><dd className="col-7">{String(booking.bookingTime).slice(0, 5)}</dd>
											<dt className="col-5">People</dt><dd className="col-7 mb-0">{booking.numberOfPeople}</dd>
										</dl>
									</div>
								</article>
							))}
						</div>
					</>
				)}
			</div>
		</section>
	)
}

function BookingStatusBadge({ status }) {
	const statusClass = {
		PENDING: 'text-bg-warning',
		CONFIRMED: 'text-bg-success',
		CANCELLED: 'text-bg-danger',
	}

	return <span className={`badge ${statusClass[status] ?? 'text-bg-secondary'}`}>{status}</span>
}

export default MyBookings
