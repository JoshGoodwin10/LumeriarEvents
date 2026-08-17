// src/pages/PublicPages/PublicEvents.tsx
import { Link } from 'react-router-dom';

const PublicEvents = () => {
    return (
        <>
            {/* Hero */}
            <header className="heronoimage" id="hero">
                <div className="container">
                    <h1>Our Events</h1>
                </div>
            </header>

            {/* Overview */}
            <section className="main-section alabaster" id="overview">
                <div className="container">
                    <h2 data-aos="fade-up" data-aos-delay="300">Inspiring Innovation Through Competition</h2>
                    <div className="row align-center">
                        <div className="grid-2">
                            <figure data-aos="fade-left" data-aos-delay="400">
                                <img src="/images/event-overview.jpg" alt="Robotics competition" className="img-fluid" />
                            </figure>
                            <div data-aos="fade-right" data-aos-delay="400">
                                <p className="mb-4">
                                    Our robotics events bring together students, educators, and industry professionals
                                    in a vibrant atmosphere of creativity and technical excellence. From regional qualifiers
                                    to national championships, each event is designed to challenge, inspire, and celebrate
                                    the next generation of innovators.
                                </p>
                                <p>
                                    Whether you're a seasoned competitor or a first‑time participant, our events provide
                                    a supportive environment where learning and collaboration come first. Teams tackle
                                    real‑world problems, develop critical skills, and build lasting friendships.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Event Categories */}
            <section className="main-section" id="categories">
                <div className="container">
                    <h2 data-aos="fade-up" data-aos-delay="300">Event Categories</h2>
                    <h6 data-aos="fade-up" data-aos-delay="400">Find the right challenge for your team</h6>

                    <div className="grid-3">
                        <div className="card" data-aos="fade-up" data-aos-delay="200">
                            <div className="feature-icon">🤖</div>
                            <h3 className="card-title">Robotics Challenges</h3>
                            <p className="card-text">
                                Design, build, and program robots to complete complex tasks. Teams compete in
                                head‑to‑head matches, obstacle courses, and autonomous missions.
                            </p>
                        </div>
                        <div className="card" data-aos="fade-up" data-aos-delay="400">
                            <div className="feature-icon">💻</div>
                            <h3 className="card-title">Coding Competitions</h3>
                            <p className="card-text">
                                Test your programming skills in algorithm challenges, game development,
                                and AI‑powered solutions. Perfect for students passionate about software.
                            </p>
                        </div>
                        <div className="card" data-aos="fade-up" data-aos-delay="600">
                            <div className="feature-icon">🏆</div>
                            <h3 className="card-title">Innovation Showcases</h3>
                            <p className="card-text">
                                Present your original projects to a panel of judges. Demonstrate creativity,
                                problem‑solving, and the ability to turn ideas into impactful solutions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="main-section alabaster" id="how-it-works">
                <div className="container">
                    <h2 data-aos="fade-up" data-aos-delay="300">How It Works</h2>
                    <div className="grid-3">
                        <div className="card" data-aos="fade-up" data-aos-delay="200">
                            <h3 className="card-title">1. Register</h3>
                            <p className="card-text">
                                Form a team of 2–5 students, choose your event category, and register online.
                                We'll send you all the materials you need to get started.
                            </p>
                        </div>
                        <div className="card" data-aos="fade-up" data-aos-delay="400">
                            <h3 className="card-title">2. Prepare</h3>
                            <p className="card-text">
                                Access our curriculum guides, practice challenges, and mentor support.
                                Build your robot or develop your solution using our kits and resources.
                            </p>
                        </div>
                        <div className="card" data-aos="fade-up" data-aos-delay="600">
                            <h3 className="card-title">3. Compete</h3>
                            <p className="card-text">
                                Attend the event, showcase your work, and compete for awards, recognition,
                                and the chance to advance to national and international stages.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Upcoming Events CTA */}
            <section className="main-section" id="upcoming-cta">
                <div className="container">
                    <div className="row">
                        <div className="col-12 text-center" data-aos="fade-up" data-aos-delay="400">
                            <h2>Ready to Compete?</h2>
                            <p className="mb-4">
                                Check out our upcoming events and secure your team's spot today.
                            </p>
                            <Link to="/events-list" className="btn">View All Events</Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default PublicEvents;