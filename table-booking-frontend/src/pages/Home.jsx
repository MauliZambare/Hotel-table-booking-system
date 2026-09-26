import { Link } from 'react-router-dom'

const benefits = [
	{ number: '01', title: 'Easy booking', description: 'Choose your date, time and party size in just a few steps.' },
	{ number: '02', title: 'Tables for every plan', description: 'From a quick lunch for two to a long dinner with friends.' },
	{ number: '03', title: 'Quick confirmation', description: 'Your booking details are ready as soon as you confirm.' },
]

function Home() {
	return (
		<>
			<section className="hero-section">
				<div className="container hero-content">
					<div className="row align-items-center g-5">
						<div className="col-lg-5">
							<p className="eyebrow">A seat at the table, made simple</p>
							<h1>Reserve your perfect table.</h1>
							<p className="hero-description">
								Save a place for the people and flavors you love. Your next memorable meal starts here.
							</p>
							<div className="d-flex flex-wrap gap-3 mt-4">
								<Link className="btn btn-brand btn-lg" to="/book-table">Book a table <span aria-hidden="true">→</span></Link>
								<Link className="btn btn-outline-brand btn-lg" to="/tables">View tables</Link>
							</div>
							<p className="hero-note mt-4 mb-0">Thoughtful dining, without the waiting.</p>
						</div>
						<div className="col-lg-7">
							<div className="hero-image-wrap">
								<img
									className="hero-image"
									src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1500&q=85"
									alt="An elegant restaurant table set for dinner"
								/>
								<div className="hero-image-caption">
									<span className="caption-dot" aria-hidden="true"></span>
									<span>Good food. Good company. Your table.</span>
								</div>
								<div className="hero-stamp" aria-label="Open daily, 11 am to 10 pm">
									<span>OPEN</span>
									<strong>11–10</strong>
									<span>DAILY</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="benefits-section py-5">
				<div className="container py-lg-3">
					<div className="section-heading mb-4 mb-lg-5">
						<p className="eyebrow">A little less planning</p>
						<h2>More time around the table.</h2>
					</div>
					<div className="row g-4">
						{benefits.map((benefit) => (
							<div className="col-md-4" key={benefit.number}>
								<article className="benefit-item h-100">
									<span className="benefit-number">{benefit.number}</span>
									<h3>{benefit.title}</h3>
									<p>{benefit.description}</p>
								</article>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="restaurant-section py-5">
				<div className="container py-lg-4">
					<div className="row align-items-center g-5">
						<div className="col-lg-5">
							<p className="eyebrow">A neighborhood favorite</p>
							<h2 className="restaurant-title">The best evenings are shared.</h2>
						</div>
						<div className="col-lg-6 offset-lg-1">
							<p className="restaurant-copy">
								At TableBook, we believe a restaurant is more than a place to eat. It is where weeknights turn into celebrations and familiar faces become friends. Settle in, take your time, and let us look after the details.
							</p>
							<div className="restaurant-details d-flex flex-wrap gap-4 mt-4">
								<div><strong>18 Market Street</strong><span>Downtown</span></div>
								<div><strong>Every day</strong><span>11:00 am – 10:00 pm</span></div>
							</div>
							<Link className="text-link mt-4 d-inline-block" to="/book-table">Find your seat <span aria-hidden="true">→</span></Link>
						</div>
					</div>
				</div>
			</section>
		</>
	)
}

export default Home
