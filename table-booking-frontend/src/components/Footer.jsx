import { Link } from 'react-router-dom'

function Footer() {
	return (
		<footer className="site-footer">
			<div className="container py-5">
				<div className="row g-4">
					<div className="col-lg-5">
						<Link className="footer-brand" to="/">TableBook</Link>
						<p className="footer-copy mt-3 mb-0">
							A good meal starts with a good seat. Find your table and make time for something delicious.
						</p>
					</div>
					<div className="col-6 col-lg-3">
						<h2 className="footer-heading">Quick links</h2>
						<ul className="list-unstyled footer-links">
							<li><Link to="/">Home</Link></li>
							<li><Link to="/tables">Our tables</Link></li>
							<li><Link to="/book-table">Book a table</Link></li>
							<li><Link to="/my-bookings">My bookings</Link></li>
						</ul>
					</div>
					<div className="col-6 col-lg-4">
						<h2 className="footer-heading">Come say hello</h2>
						<p className="footer-copy mb-1">18 Market Street, Downtown</p>
						<a className="footer-contact" href="tel:+15550142800">+1 (555) 014-2800</a>
						<br />
						<a className="footer-contact" href="mailto:hello@tablebook.example">hello@tablebook.example</a>
					</div>
				</div>
				<div className="footer-bottom mt-4 pt-3">
					<small>© {new Date().getFullYear()} TableBook. Made for good meals and better company.</small>
				</div>
			</div>
		</footer>
	)
}

export default Footer
