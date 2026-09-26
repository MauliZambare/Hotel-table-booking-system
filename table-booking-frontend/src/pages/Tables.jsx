import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { getApiErrorMessage } from '../services/api.js'

function Tables() {
	const [tables, setTables] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [reloadKey, setReloadKey] = useState(0)

	useEffect(() => {
		let isCurrent = true

		async function loadTables() {
			setLoading(true)
			setError('')
			try {
				const response = await api.get('/tables')
				if (isCurrent) setTables(response.data)
			} catch (requestError) {
				if (isCurrent) setError(getApiErrorMessage(requestError, 'Unable to load tables. Please try again.'))
			} finally {
				if (isCurrent) setLoading(false)
			}
		}

		loadTables()
		return () => { isCurrent = false }
	}, [reloadKey])

	return (
		<section className="page-section">
			<div className="container py-5">
				<div className="page-heading mb-4 mb-lg-5">
					<p className="eyebrow">Find your place</p>
					<h1>Tables for every occasion.</h1>
					<p className="text-muted mb-0">Choose a table that suits your group. Availability is shown below.</p>
				</div>
				{error && (
					<div className="alert alert-danger d-flex align-items-center justify-content-between gap-3" role="alert">
						<span>{error}</span>
						<button className="btn btn-sm btn-outline-danger flex-shrink-0" type="button" onClick={() => setReloadKey((key) => key + 1)}>
							Try again
						</button>
					</div>
				)}
				{loading && (
					<div className="d-flex align-items-center gap-2 py-4" role="status">
						<span className="spinner-border spinner-border-sm text-danger" aria-hidden="true"></span>
						<span>Loading tables...</span>
					</div>
				)}
				{!loading && !error && tables.length === 0 && (
					<div className="alert alert-info" role="status">There are no tables to display right now.</div>
				)}
				<div className="row g-4">
					{tables.map((table) => {
						const isAvailable = table.status === 'AVAILABLE'
						return (
						<div className="col-sm-6 col-lg-3" key={table.id}>
							<article className="table-card h-100">
								<div className="table-card-top">
									<span className="table-symbol" aria-hidden="true">T{String(table.tableNumber).padStart(2, '0')}</span>
									<span className={`badge ${isAvailable ? 'text-bg-success' : 'text-bg-danger'}`}>
										{isAvailable ? 'Available' : 'Booked'}
									</span>
								</div>
								<h2>Table {table.tableNumber}</h2>
								<p>{table.capacity} {table.capacity === 1 ? 'seat' : 'seats'}</p>
								{isAvailable ? (
									<Link className="btn btn-brand w-100 mt-3" to="/book-table">Book this table</Link>
								) : (
									<button className="btn btn-outline-secondary w-100 mt-3" type="button" disabled>Currently booked</button>
								)}
							</article>
						</div>
						)
					})}
				</div>
			</div>
		</section>
	)
}

export default Tables
