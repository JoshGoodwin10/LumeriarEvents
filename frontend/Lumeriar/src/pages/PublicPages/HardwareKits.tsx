// src/pages/PublicPages/HardwareKits.tsx
import { Link } from 'react-router-dom';

const HardwareKits = () => {
    return (
        <>
            {/* Hero */}
            <header className="heronoimage" id="hero">
                <div className="container">
                    <h1>Durable Classroom Kits</h1>
                </div>
            </header>

            {/* Overview Section */}
            <section className="main-section alabaster" id="overview">
                <div className="container">
                    <h2 data-aos="fade-up" data-aos-delay="300">Built for the Classroom</h2>
                    <div className="row align-center">
                        <div className="grid-2">
                            <div data-aos="fade-right" data-aos-delay="400">
                                <p className="mb-4">Our robotics kits are designed specifically for educational use, prioritizing
                                    durability, ease of use, and pedagogical value. Our kits withstand
                                    repeated classroom use, support multiple learning styles, and integrate seamlessly with our
                                    CAPS-aligned curriculums.</p>
                                <p>Each kit includes all necessary components, clear assembly instructions, and robust storage
                                    solutions to maximize classroom efficiency and minimize setup time.</p>
                            </div>
                            <figure data-aos="fade-left" data-aos-delay="400">
                                <img src="../images/laptop and robot.jpeg" alt="Robotics kit" className="img-fluid" />
                            </figure>
                        </div>
                    </div>
                </div>
            </section>

            {/* Kit Features Section */}
            <section className="main-section" id="features">
                <div className="container">
                    <h2 data-aos="fade-up" data-aos-delay="300">Why Our Kits Stand Out</h2>
                    <h6 data-aos="fade-up" data-aos-delay="400">Designed with teachers and students in mind</h6>

                    <div className="grid-3">
                        <div data-aos="fade-up" data-aos-delay="300">
                            <div className="card no-hover">
                                <div className="feature-icon">🔧</div>
                                <h3 className="card-title">Classroom Durable</h3>
                                <p className="card-text">Reinforced components, industrial-grade materials, and robust connectors
                                    designed to withstand hundreds of assembly cycles without wear or breakage.</p>
                            </div>
                        </div>
                        <div data-aos="fade-up" data-aos-delay="600">
                            <div className="card no-hover">
                                <div className="feature-icon">⚡</div>
                                <h3 className="card-title">Easy Assembly</h3>
                                <p className="card-text">Color-coded parts, easy to use connections, and intuitive designs ensure
                                    students spend time learning, not struggling with complicated builds.</p>
                            </div>
                        </div>
                        <div data-aos="fade-up" data-aos-delay="900">
                            <div className="card no-hover">
                                <div className="feature-icon">📦</div>
                                <h3 className="card-title">Endless Versatility</h3>
                                <p className="card-text">Our kits support a wide range of learning objectives and project types,
                                    from simple machines to complex robotics, allowing for creativity and differentiation in
                                    the classroom.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Kit Levels Section */}
            <section className="main-section alabaster" id="kit-levels">
                <div className="container">
                    <h2 data-aos="fade-up" data-aos-delay="300">Kit Range</h2>
                    <h6 data-aos="fade-up" data-aos-delay="400">Scalable solutions from beginner to advanced</h6>

                    <div className="grid-3">
                        <div data-aos="fade-up" data-aos-delay="200">
                            <div className="card">
                                <h3 className="card-title">Discovery Kit</h3>
                                <div className="kit-level">Foundation Phase</div>
                                <p className="card-text mb-3">Ideal for Grade R-3. Supports unplugged and introductory robotics
                                    learning through tactile building and simple programmable movement activities.</p>
                                <ul className="kit-specs">
                                    <li>Basic motion modules (wheels & gears)</li>
                                    <li>Push-button programmable controller</li>
                                    <li>Introductory sensor units (light / touch)</li>
                                </ul>
                            </div>
                        </div>
                        <div data-aos="fade-up" data-aos-delay="400">
                            <div className="card">
                                <h3 className="card-title">Explorer Kit</h3>
                                <div className="kit-level">Intermediate Phase</div>
                                <p className="card-text mb-3">Ideal for Grade 4-6. Enables learners to design, build and program
                                    robotic systems using the Engineering Design Process and block-based coding.</p>
                                <ul className="kit-specs">
                                    <li>Servo motors & drive motors</li>
                                    <li>Programmable controller unit</li>
                                    <li>Environmental sensors (ultrasonic / light / touch)</li>
                                </ul>
                            </div>
                        </div>
                        <div data-aos="fade-up" data-aos-delay="600">
                            <div className="card">
                                <h3 className="card-title">Innovator Kit</h3>
                                <div className="kit-level">Senior Phase</div>
                                <p className="card-text mb-3">Ideal for Grade 7-9. Supports advanced robotics builds incorporating
                                    sensors, actuators and programmable logic for real-world problem-solving projects.</p>
                                <ul className="kit-specs">
                                    <li>Multiple motors & servo units</li>
                                    <li>Programmable microcontroller</li>
                                    <li>Multi-sensor integration (PIR / distance / line tracking)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Support Section */}
            <section className="main-section" id="support">
                <div className="container">
                    <h2 data-aos="fade-up" data-aos-delay="300">Comprehensive Support</h2>
                    <div className="row">
                        <div className="wow fadeInUp delay-04s" data-aos="fade-up" data-aos-delay="400">
                            <h3 className="card-title mb-3">Warranty & Replacement</h3>
                            <p className="card-text">All kits include a 2-year warranty with free component replacement for
                                manufacturing defects. Quick turnaround ensures minimal classroom disruption.</p>
                        </div>
                        <div className="wow fadeInUp delay-06s" data-aos="fade-up" data-aos-delay="600">
                            <h3 className="card-title mb-3">Technical Assistance</h3>
                            <p className="card-text">Access to dedicated support team via email and phone call. We provide
                                troubleshooting guides, tutorials, and direct technical help when needed.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="main-section alabaster" id="cta">
                <div className="container">
                    <div className="row">
                        <div className="col-12 text-center" data-aos="fade-up" data-aos-delay="400">
                            <h2>Equip Your Classroom Today</h2>
                            <p className="mb-4">Request a quote, schedule a demo, or order sample kits for evaluation.</p>
                            <Link to="/contact" className="btn">Get Started</Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default HardwareKits;