import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { getApiErrorMessage } from '../services/api.js'

const summaryCards = [
	{ key: 'totalTables', label: 'Total Tables', tone: 'admin-tone-rust' },
	{ key: 'availableTables', label: 'Available Tables', tone: 'admin-tone-green' },
	{ key: 'bookedTables', label: 'Booked Tables', tone: 'admin-tone-red' },
	{ key: 'totalBookings', label: 'Total Bookings', tone: 'admin-tone-ink' },
	{ key: 'pendingBookings', label: 'Pending Bookings', tone: 'admin-tone-amber' },
	{ key: 'confirmedBookings', label: 'Confirmed Bookings', tone: 'admin-tone-blue' },
	{ key: 'cancelledBookings', label: 'Cancelled Bookings', tone: 'admin-tone-red' },
]

function AdminDashboard() {
	const [tables, setTables] = useState([])
	const [bookings, setBookings] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [reloadKey, setReloadKey] = useState(0)

	useEffect(() => {
		let isCurrent = true

		async function loadDashboard() {
			setLoading(true)
			setError('')
			try {
				const [tableResponse, bookingResponse] = await Promise.all([
					api.get('/tables'),
					api.get('/bookings'),
				])
				if (isCurrent) {
					setTables(tableResponse.data)
					setBookings(bookingResponse.data)
				}
			} catch (requestError) {
				if (isCurrent) setError(getApiErrorMessage(requestError, 'Unable to load dashboard data. Please try again.'))
			} finally {
				if (isCurrent) setLoading(false)
			}
		}

		loadDashboard()
		return () => { isCurrent = false }
	}, [reloadKey])

	const statistics = {
		totalTables: tables.length,
		availableTables: tables.filter((table) => table.status === 'AVAILABLE').length,
		bookedTables: tables.filter((table) => table.status === 'BOOKED').length,
		totalBookings: bookings.length,
		pendingBookings: bookings.filter((booking) => booking.status === 'PENDING').length,
		confirmedBookings: bookings.filter((booking) => booking.status === 'CONFIRMED').length,
		cancelledBookings: bookings.filter((booking) => booking.status === 'CANCELLED').length,
	}

	const recentBookings = [...bookings]
		.sort((left, right) => `${right.bookingDate}T${right.bookingTime}`.localeCompare(`${left.bookingDate}T${left.bookingTime}`))
		.slice(0, 5)

	return (
		<section className="admin-page">
			<div className="container py-4 py-lg-5">
				<div className="admin-page-heading d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
					<div>
						<p className="eyebrow">Restaurant operations</p>
						<h1>Dashboard</h1>
						<p className="text-muted mb-0">A quick view of tables and upcoming reservations.</p>
					</div>
					<div className="d-flex gap-2">
						<Link className="btn btn-outline-secondary" to="/admin/tables">Manage tables</Link>
						<Link className="btn btn-brand" to="/admin/bookings">Manage bookings</Link>
					</div>
				</div>

				{error && (
					<div className="alert alert-danger d-flex align-items-center justify-content-between gap-3" role="alert">
						<span>{error}</span>
						<button className="btn btn-sm btn-outline-danger flex-shrink-0" type="button" onClick={() => setReloadKey((key) => key + 1)}>Try again</button>
					</div>
				)}
				{loading && (
					<div className="d-flex align-items-center gap-2 py-3" role="status">
						<span className="spinner-border spinner-border-sm text-danger" aria-hidden="true"></span>
						<span>Loading dashboard...</span>
					</div>
				)}

				<div className="row g-3 mb-4">
					{summaryCards.map((card) => (
						<div className="col-sm-6 col-xl-4" key={card.key}>
							<article className={`card admin-stat-card h-100 ${card.tone}`}>
								<div className="card-body">
									<p className="admin-stat-label">{card.label}</p>
									<p className="admin-stat-value mb-0">{loading || error ? '—' : statistics[card.key]}</p>
								</div>
							</article>
						</div>
					))}
				</div>

				<section className="admin-panel">
					<div className="d-flex align-items-center justify-content-between gap-3 mb-3">
						<div>
							<h2 className="admin-section-title mb-1">Recent bookings</h2>
							<p className="text-muted small mb-0">Latest reservations from the booking list.</p>
						</div>
						<Link className="admin-text-link" to="/admin/bookings">View all</Link>
					</div>
					{loading ? (
						<div className="text-muted py-3">Loading recent bookings...</div>
					) : error ? (
						<div className="alert alert-light border mb-0">Recent bookings are unavailable until the API reconnects.</div>
					) : recentBookings.length === 0 ? (
						<div className="alert alert-light border mb-0">No bookings found.</div>
					) : (
						<div className="table-responsive admin-table-wrap">
							<table className="table table-hover align-middle mb-0">
								<thead>
									<tr><th scope="col">Booking</th><th scope="col">Customer</th><th scope="col">Table</th><th scope="col">Date</th><th scope="col">Time</th><th scope="col">Status</th></tr>
								</thead>
								<tbody>
									{recentBookings.map((booking) => (
										<tr key={booking.id}>
											<th scope="row">#{booking.id}</th>
											<td>{booking.customerName}</td>
											<td>Table {booking.tableNumber}</td>
											<td>{booking.bookingDate}</td>
											<td>{String(booking.bookingTime).slice(0, 5)}</td>
											<td><BookingBadge status={booking.status} /></td>
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

function BookingBadge({ status }) {
	const badgeClass = {
		PENDING: 'text-bg-warning',
		CONFIRMED: 'text-bg-success',
		CANCELLED: 'text-bg-danger',
	}

	return <span className={`badge ${badgeClass[status] ?? 'text-bg-secondary'}`}>{status}</span>
}

export default AdminDashboard
