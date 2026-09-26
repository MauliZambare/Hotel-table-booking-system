import { useEffect, useState } from 'react'
import api, { getApiErrorMessage } from '../services/api.js'

const emptyForm = { tableNumber: '', capacity: '', status: 'AVAILABLE' }

function ManageTables() {
	const [tables, setTables] = useState([])
	const [tableForm, setTableForm] = useState(emptyForm)
	const [editingTable, setEditingTable] = useState(null)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [busyDeleteId, setBusyDeleteId] = useState(null)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
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

	function startEditing(table) {
		setEditingTable(table)
		setTableForm({
			tableNumber: String(table.tableNumber),
			capacity: String(table.capacity),
			status: table.status,
		})
		setError('')
		setSuccess('')
	}

	function cancelEditing() {
		setEditingTable(null)
		setTableForm(emptyForm)
		setError('')
	}

	async function handleSubmit(event) {
		event.preventDefault()
		setSaving(true)
		setError('')
		setSuccess('')

		const tableRequest = {
			tableNumber: Number(tableForm.tableNumber),
			capacity: Number(tableForm.capacity),
			status: tableForm.status,
		}

		try {
			if (editingTable) {
				await api.put(`/tables/${editingTable.id}`, tableRequest)
				setSuccess(`Table ${tableRequest.tableNumber} updated.`)
			} else {
				await api.post('/tables', tableRequest)
				setSuccess(`Table ${tableRequest.tableNumber} added.`)
			}
			setEditingTable(null)
			setTableForm(emptyForm)
			setReloadKey((key) => key + 1)
		} catch (requestError) {
			setError(getApiErrorMessage(requestError, 'Unable to save this table. Please check the details and try again.'))
		} finally {
			setSaving(false)
		}
	}

	async function deleteTable(table) {
		const confirmed = window.confirm(`Delete Table ${table.tableNumber}? This action cannot be undone.`)
		if (!confirmed) return

		setBusyDeleteId(table.id)
		setError('')
		setSuccess('')
		try {
			await api.delete(`/tables/${table.id}`)
			setSuccess(`Table ${table.tableNumber} deleted.`)
			setReloadKey((key) => key + 1)
		} catch (requestError) {
			setError(getApiErrorMessage(requestError, 'Unable to delete this table. It may be in use by a booking.'))
		} finally {
			setBusyDeleteId(null)
		}
	}

	return (
		<section className="admin-page">
			<div className="container py-4 py-lg-5">
				<div className="admin-page-heading mb-4">
					<p className="eyebrow">Restaurant setup</p>
					<h1>Manage tables</h1>
					<p className="text-muted mb-0">Add tables, update capacity and availability, or remove a table.</p>
				</div>

				{error && <div className="alert alert-danger" role="alert">{error}</div>}
				{success && <div className="alert alert-success" role="status">{success}</div>}

				<div className="row g-4 align-items-start">
					<div className="col-lg-4">
						<section className="admin-panel">
							<h2 className="admin-section-title mb-3">{editingTable ? `Edit Table ${editingTable.tableNumber}` : 'Add a table'}</h2>
							<form onSubmit={handleSubmit}>
								<div className="mb-3">
									<label className="form-label" htmlFor="admin-table-number">Table number</label>
									<input className="form-control" id="admin-table-number" type="number" min="1" value={tableForm.tableNumber} onChange={(event) => setTableForm({ ...tableForm, tableNumber: event.target.value })} required />
								</div>
								<div className="mb-3">
									<label className="form-label" htmlFor="admin-table-capacity">Capacity</label>
									<input className="form-control" id="admin-table-capacity" type="number" min="1" value={tableForm.capacity} onChange={(event) => setTableForm({ ...tableForm, capacity: event.target.value })} required />
								</div>
								<div className="mb-4">
									<label className="form-label" htmlFor="admin-table-status">Status</label>
									<select className="form-select" id="admin-table-status" value={tableForm.status} onChange={(event) => setTableForm({ ...tableForm, status: event.target.value })} required>
										<option value="AVAILABLE">AVAILABLE</option>
										<option value="BOOKED">BOOKED</option>
									</select>
								</div>
								<div className="d-flex gap-2">
									<button className="btn btn-brand flex-grow-1" type="submit" disabled={saving}>
										{saving ? 'Saving...' : editingTable ? 'Save changes' : 'Add table'}
									</button>
									{editingTable && <button className="btn btn-outline-secondary" type="button" onClick={cancelEditing}>Cancel</button>}
								</div>
							</form>
						</section>
					</div>

					<div className="col-lg-8">
						<section className="admin-panel">
							<div className="d-flex align-items-center justify-content-between gap-3 mb-3">
								<h2 className="admin-section-title mb-0">All tables</h2>
								<span className="text-muted small">{loading ? 'Loading...' : error && tables.length === 0 ? 'Unavailable' : `${tables.length} total`}</span>
							</div>
							{loading ? (
								<div className="d-flex align-items-center gap-2 py-4" role="status">
									<span className="spinner-border spinner-border-sm text-danger" aria-hidden="true"></span>
									<span>Loading tables...</span>
								</div>
							) : tables.length === 0 ? (
								error ? null : <div className="alert alert-light border mb-0">No tables found. Add the first table using the form.</div>
							) : (
								<div className="table-responsive admin-table-wrap">
									<table className="table table-hover align-middle mb-0">
										<thead><tr><th scope="col">Table</th><th scope="col">Capacity</th><th scope="col">Status</th><th scope="col">Actions</th></tr></thead>
										<tbody>
											{tables.map((table) => (
												<tr key={table.id}>
													<th scope="row">Table {table.tableNumber}</th>
													<td>{table.capacity} {table.capacity === 1 ? 'seat' : 'seats'}</td>
													<td><span className={`badge ${table.status === 'AVAILABLE' ? 'text-bg-success' : 'text-bg-danger'}`}>{table.status}</span></td>
													<td>
														<div className="d-flex gap-2">
															<button className="btn btn-sm btn-outline-secondary" type="button" onClick={() => startEditing(table)}>Edit</button>
															<button className="btn btn-sm btn-outline-danger" type="button" disabled={busyDeleteId === table.id} onClick={() => deleteTable(table)}>
																{busyDeleteId === table.id ? 'Deleting...' : 'Delete'}
															</button>
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
				</div>
			</div>
		</section>
	)
}

export default ManageTables
