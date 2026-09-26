import { useEffect, useState } from 'react'
import api, { getApiErrorMessage } from '../services/api.js'

const bookingStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED']
const statusBadgeClass = {
	PENDING: 'text-bg-warning',
	CONFIRMED: 'text-bg-success',
	CANCELLED: 'text-bg-danger',
}

function ManageBookings() {
	const [bookings, setBookings] = useState([])
	const [statusSelections, setStatusSelections] = useState({})
	const [loading, setLoading] = useState(true)
	const [savingId, setSavingId] = useState(null)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [searchTerm, setSearchTerm] = useState('')
	const [statusFilter, setStatusFilter] = useState('ALL')
	const [reloadKey, setReloadKey] = useState(0)

	useEffect(() => {
		let isCurrent = true

		async function loadBookings() {
			setLoading(true)
			setError('')
			try {
				const response = await api.get('/bookings')
				if (isCurrent) {
					setBookings(response.data)
					setStatusSelections(Object.fromEntries(response.data.map((booking) => [booking.id, booking.status])))
				}
			} catch (requestError) {
				if (isCurrent) setError(getApiErrorMessage(requestError, 'Unable to load bookings. Please try again.'))
			} finally {
				if (isCurrent) setLoading(false)
			}
		}

		loadBookings()
		return () => { isCurrent = false }
	}, [reloadKey])

	const filteredBookings = bookings.filter((booking) => {
		const matchesName = booking.customerName.toLowerCase().includes(searchTerm.trim().toLowerCase())
		const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter
		return matchesName && matchesStatus
	})

	async function saveStatus(booking, requestedStatus = statusSelections[booking.id] ?? booking.status) {
		const status = requestedStatus
		if (status === booking.status) return

		setSavingId(booking.id)
		setError('')
		setSuccess('')
		try {
			const response = await api.put(`/bookings/${booking.id}/status`, { status })
			setBookings((currentBookings) => currentBookings.map((item) => item.id === booking.id ? response.data : item))
			setStatusSelections((currentSelections) => ({ ...currentSelections, [booking.id]: response.data.status }))
			setSuccess(`Booking #${booking.id} updated to ${response.data.status}.`)
		} catch (requestError) {
			setError(getApiErrorMessage(requestError, 'Unable to update this booking status. Please try again.'))
		} finally {
			setSavingId(null)
		}
	}

	return (
		<section className="admin-page">
			<div className="container py-4 py-lg-5">
				<div className="admin-page-heading mb-4">
					<p className="eyebrow">Reservation desk</p>
					<h1>Manage bookings</h1>
					<p className="text-muted mb-0">Review customer details and keep each booking status up to date.</p>
				</div>

				{error && (
					<div className="alert alert-danger d-flex align-items-center justify-content-between gap-3" role="alert">
						<span>{error}</span>
						<button className="btn btn-sm btn-outline-danger flex-shrink-0" type="button" onClick={() => setReloadKey((key) => key + 1)}>Try again</button>
					</div>
				)}
				{success && <div className="alert alert-success" role="status">{success}</div>}

				<section className="admin-panel">
					<div className="d-flex align-items-center justify-content-between gap-3 mb-3">
						<h2 className="admin-section-title mb-0">All bookings</h2>
						<span className="text-muted small">{loading ? 'Loading...' : error && bookings.length === 0 ? 'Unavailable' : `${bookings.length} total`}</span>
					</div>
					<div className="row g-3 mb-3">
						<div className="col-md-7">
							<label className="visually-hidden" htmlFor="booking-search">Search customer name</label>
							<input className="form-control" id="booking-search" type="search" placeholder="Search customer name" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
						</div>
						<div className="col-md-5">
							<label className="visually-hidden" htmlFor="booking-status-filter">Filter booking status</label>
							<select className="form-select" id="booking-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
								<option value="ALL">All statuses</option>
								{bookingStatuses.map((status) => <option value={status} key={status}>{status}</option>)}
							</select>
						</div>
					</div>
					{loading ? (
						<div className="d-flex align-items-center gap-2 py-4" role="status">
							<span className="spinner-border spinner-border-sm text-danger" aria-hidden="true"></span>
							<span>Loading bookings...</span>
						</div>
					) : bookings.length === 0 ? (
						error ? null : <div className="alert alert-light border mb-0">No bookings found.</div>
					) : filteredBookings.length === 0 ? (
						<div className="alert alert-light border mb-0">No bookings match your search or status filter.</div>
					) : (
						<div className="table-responsive admin-table-wrap">
							<table className="table table-hover align-middle mb-0 admin-bookings-table">
								<thead>
									<tr><th scope="col">Booking</th><th scope="col">Customer</th><th scope="col">Phone</th><th scope="col">Email</th><th scope="col">Table</th><th scope="col">Date</th><th scope="col">Time</th><th scope="col">People</th><th scope="col">Status</th><th scope="col">Update</th></tr>
								</thead>
								<tbody>
									{filteredBookings.map((booking) => (
										<tr key={booking.id}>
											<th scope="row">#{booking.id}</th>
											<td>{booking.customerName}</td>
											<td>{booking.phone}</td>
											<td>{booking.email}</td>
											<td>Table {booking.tableNumber}</td>
											<td>{booking.bookingDate}</td>
											<td>{String(booking.bookingTime).slice(0, 5)}</td>
											<td>{booking.numberOfPeople}</td>
											<td><span className={`badge ${statusBadgeClass[booking.status] ?? 'text-bg-secondary'}`}>{booking.status}</span></td>
											<td>
												<div className="d-flex align-items-center gap-2">
													<select
														className="form-select form-select-sm admin-status-select"
														aria-label={`Status for booking ${booking.id}`}
														value={statusSelections[booking.id] ?? booking.status}
														onChange={(event) => setStatusSelections((current) => ({ ...current, [booking.id]: event.target.value }))}
													>
														{bookingStatuses.map((status) => <option value={status} key={status}>{status}</option>)}
													</select>
													<button className="btn btn-sm btn-brand" type="button" disabled={savingId === booking.id || (statusSelections[booking.id] ?? booking.status) === booking.status} onClick={() => saveStatus(booking)}>
														{savingId === booking.id ? 'Saving...' : 'Save'}
													</button>
													{booking.status !== 'CONFIRMED' && (
														<button className="btn btn-sm btn-outline-success" type="button" disabled={savingId === booking.id} onClick={() => saveStatus(booking, 'CONFIRMED')}>Confirm</button>
													)}
													{booking.status !== 'CANCELLED' && (
														<button className="btn btn-sm btn-outline-danger" type="button" disabled={savingId === booking.id} onClick={() => saveStatus(booking, 'CANCELLED')}>Cancel</button>
													)}
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</section>
			</div>
		</section>
	)
}

export default ManageBookings
