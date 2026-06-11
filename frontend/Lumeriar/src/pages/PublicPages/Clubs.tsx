// src/pages/PublicPages/Clubs.tsx
import { Link } from 'react-router-dom';

const Clubs = () => {
    return (
        <>
            {/* Hero */}
            <header className="heronoimage" id="hero">
                <div className="container">
                    <h1>School Robotics Clubs</h1>
                </div>
            </header>

            {/* Overview Section */}
            <section className="main-section alabaster" id="overview">
                <div className="container">
                    <div className="row align-center">
                        <div className="grid-2">
                            <figure data-aos="fade-left" data-aos-delay="400">
                                <img src="../images/working on robot hands.jpeg" alt="Students in robotics club" className="img-fluid" />
                            </figure>
                            <div data-aos="fade-right" data-aos-delay="400">
                                <h2 data-aos="fade-up" data-aos-delay="300">More Than Just a Club</h2>
                                <p className="mb-4">Our school robotics clubs provide a structured, engaging after-school environment
                                    where students explore coding, engineering, and problem-solving through hands-on robotics
                                    projects. From complete beginners to advanced builders, every student finds their place in our
                                    inclusive, collaborative club sessions.</p>
                                <p className="mb-4">We handle everything—from curriculum planning and kit provision to coach training
                                    and competition preparation—so your school can launch and sustain a thriving robotics club with
                                    minimal administrative overhead.</p>
                                <p>Whether you're starting from scratch or looking to enhance an existing programme, we tailor our
                                    club offerings to your school's needs, schedule, and goals.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* What's Included Section */}
            <section className="main-section" id="whats-included">
                <div className="container">
                    <h2 data-aos="fade-up" data-aos-delay="300">What's Included</h2>
                    <h6 data-aos="fade-up" data-aos-delay="400">Everything you need to run a successful club</h6>

                    <div className="grid-4">
                        <div className="card no-hover" data-aos="fade-up" data-aos-delay="200">
                            <div className="feature-icon">🤖</div>
                            <h3 className="card-title">Robotics Kits</h3>
                            <p className="card-text">Full set of age-appropriate, classroom-durable robotics kits for club
                                sessions. Kits remain at your school for the programme duration.</p>
                        </div>
                        <div className="card no-hover" data-aos="fade-up" data-aos-delay="400">
                            <div className="feature-icon">📚</div>
                            <h3 className="card-title">Educational Resources</h3>
                            <p className="card-text">Comprehensive teaching materials, lesson plans, and assessment tools to support
                                your club's learning objectives.</p>
                        </div>
                        <div className="card no-hover" data-aos="fade-up" data-aos-delay="600">
                            <div className="feature-icon">🌐</div>
                            <h3 className="card-title">Online Community</h3>
                            <p className="card-text">Access to our exclusive online forum where you can connect with other club
                                leaders, share best practices, and get support from our team.</p>
                        </div>
                        <div className="card no-hover" data-aos="fade-up" data-aos-delay="800">
                            <div className="feature-icon">💡</div>
                            <h3 className="card-title">Innovation Challenges</h3>
                            <p className="card-text">Regular innovation challenges that encourage students to think creatively and
                                apply their robotics skills to real-world problems.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Schedule & Logistics Section */}
            <section className="main-section alabaster" id="logistics">
                <div className="container">
                    <h2 data-aos="fade-up" data-aos-delay="300">Schedule & Logistics</h2>

                    <div className="grid-3">
                        <div className="card" data-aos="fade-up" data-aos-delay="200">
                            <h3 className="card-title mb-3">Flexible Scheduling</h3>
                            <p className="card-text mb-3">Clubs run after school, typically 2:30-4:30 PM, but we adapt to your
                                school's timetable. Sessions can be scheduled on any weekday, with most schools choosing
                                Tuesday, Wednesday, or Thursday.</p>
                            <p className="card-text">We recommend 10-15 students per club for optimal engagement and individualized
                                attention.</p>
                        </div>
                        <div className="card" data-aos="fade-up" data-aos-delay="400">
                            <h3 className="card-title mb-3">Term Structure</h3>
                            <p className="card-text mb-3">Clubs operate during school terms (approximately 10-12 weeks per term).
                                Most schools run clubs for 2-3 terms per year, with Term 4 often reserved for competitions and
                                showcases.</p>
                            <p className="card-text">We provide end-of-term showcase events where students demonstrate their
                                projects to parents and peers.</p>
                        </div>
                        <div className="card" data-aos="fade-up" data-aos-delay="600">
                            <h3 className="card-title mb-3">Space Requirements</h3>
                            <p className="card-text mb-3">A standard classroom with tables and chairs is sufficient. Access to
                                power outlets for charging devices is helpful but not essential—our kits have long battery
                                life.</p>
                            <p className="card-text">Storage space for a single kit box (approximately 60cm x 40cm x 30cm) is
                                needed between sessions.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Competitions & Events Section */}
            <section className="main-section" id="competitions">
                <div className="container">
                    <h2 data-aos="fade-up" data-aos-delay="300">Competitions & Showcases</h2>

                    <div className="grid-4">
                        <div className="card bg-light" data-aos="fade-up" data-aos-delay="200">
                            <h3 className="card-title">Internal Challenges</h3>
                            <p className="card-text">Monthly mini-challenges within your club to build skills, confidence, and
                                friendly competition. Low-pressure environment for all skill levels.</p>
                        </div>
                        <div className="card bg-light" data-aos="fade-up" data-aos-delay="400">
                            <h3 className="card-title">Regional Competitions</h3>
                            <p className="card-text">Interschool competitions held quarterly in major cities. Students compete
                                in age-appropriate challenges and meet peers from other schools.</p>
                        </div>
                        <div className="card bg-light" data-aos="fade-up" data-aos-delay="600">
                            <h3 className="card-title">National Championships</h3>
                            <p className="card-text">Annual national event bringing together top teams. Students compete for
                                prizes, recognition, and potential scholarships or industry exposure.</p>
                        </div>
                        <div className="card bg-light" data-aos="fade-up" data-aos-delay="800">
                            <h3 className="card-title">Parent Showcases</h3>
                            <p className="card-text">End-of-term events where students present projects to parents,
                                demonstrating what they've learned and celebrating their achievements.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Success Stories Section */}
            <section className="main-section alabaster" id="success-stories">
                <div className="container">
                    <h2 data-aos="fade-up" data-aos-delay="300">Success Stories</h2>
                    <h6 data-aos="fade-up" data-aos-delay="400">Real impact from our school clubs</h6>

                    <div className="grid-4">
                        <div className="card" data-aos="fade-up" data-aos-delay="200">
                            <div className="success-stat">85%</div>
                            <h3 className="card-title">Student Retention</h3>
                            <p className="card-text">Of students who join our clubs continue for multiple terms, showing high
                                engagement and sustained interest in robotics.</p>
                        </div>
                        <div className="card" data-aos="fade-up" data-aos-delay="400">
                            <div className="success-stat">40+</div>
                            <h3 className="card-title">Active Schools</h3>
                            <p className="card-text">Schools across South Africa currently running Lumeriar robotics clubs,
                                from rural communities to major urban centers.</p>
                        </div>
                        <div className="card" data-aos="fade-up" data-aos-delay="600">
                            <div className="success-stat">12</div>
                            <h3 className="card-title">Competition Wins</h3>
                            <p className="card-text">National and regional competition victories by Lumeriar club teams in the
                                past year, with students earning recognition and scholarships.</p>
                        </div>
                        <div className="card" data-aos="fade-up" data-aos-delay="800">
                            <div className="success-stat">95%</div>
                            <h3 className="card-title">Teacher Satisfaction</h3>
                            <p className="card-text">Of teachers running Lumeriar clubs report feeling confident and supported,
                                with comprehensive training and ongoing assistance.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="main-section" id="testimonials">
                <div className="container">
                    <h2 data-aos="fade-up" data-aos-delay="300">What Schools Are Saying</h2>

                    <div className="grid-3">
                        <div className="card bg-light" data-aos="fade-up" data-aos-delay="200">
                            <p className="card-text italic mb-3">"Our robotics club has become one of the most popular
                                after-school activities. Students are learning, collaborating, and having a blast. The
                                support from Lumeriar makes it easy to run."</p>
                        </div>
                        <div className="card bg-light" data-aos="fade-up" data-aos-delay="400">
                            <p className="card-text italic mb-3">"We've seen remarkable growth in our students' confidence and
                                problem-solving abilities. The curriculum is well-paced and the kits are incredibly
                                durable."</p>
                        </div>
                        <div className="card bg-light" data-aos="fade-up" data-aos-delay="600">
                            <p className="card-text italic mb-3">"As a teacher with no coding background, I was nervous. But
                                the training was excellent and I now feel fully equipped to lead our club. It's incredibly
                                rewarding."</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="main-section alabaster" id="pricing">
                <div className="container">
                    <h2 data-aos="fade-up" data-aos-delay="300">Pricing & Packages</h2>

                    <div className="grid-4">
                        <div className="card" data-aos="fade-up" data-aos-delay="200">
                            <h3 className="card-title">Starter Package</h3>
                            <p className="card-text mb-3">Perfect for schools launching their first robotics club. Includes
                                kits, curriculum, and basic training for one club (up to 15 students).</p>
                            <ul className="pricing-features">
                                <li>1 robotics kit set</li>
                                <li>Term curriculum</li>
                                <li>1-day coach training</li>
                                <li>Email support</li>
                            </ul>
                        </div>
                        <div className="card" data-aos="fade-up" data-aos-delay="400">
                            <h3 className="card-title">Growth Package</h3>
                            <p className="card-text mb-3">For schools running multiple clubs or larger groups. Includes
                                additional kits, competition prep, and enhanced support.</p>
                            <ul className="pricing-features">
                                <li>2 robotics kit sets</li>
                                <li>Full curriculum</li>
                                <li>2-day training</li>
                                <li>Competition registration</li>
                                <li>Quarterly check-ins</li>
                            </ul>
                        </div>
                        <div className="card" data-aos="fade-up" data-aos-delay="600">
                            <h3 className="card-title">Premium Package</h3>
                            <p className="card-text mb-3">Comprehensive programme for schools committed to excellence. Includes
                                advanced kits, intensive training, and dedicated support.</p>
                            <ul className="pricing-features">
                                <li>3+ robotics kit sets</li>
                                <li>Advanced curriculum</li>
                                <li>Full training programme</li>
                                <li>Competition prep & support</li>
                                <li>Monthly site visits</li>
                                <li>Parent showcase events</li>
                            </ul>
                        </div>
                        <div className="card" data-aos="fade-up" data-aos-delay="800">
                            <h3 className="card-title">Enterprise Package</h3>
                            <p className="card-text mb-3">Tailored for large institutions with multiple robotics programs. Includes
                                custom solutions, dedicated account management, and priority support.</p>
                            <ul className="pricing-features">
                                <li>Custom robotics kit sets</li>
                                <li>Personalized curriculum</li>
                                <li>Extended training programme</li>
                                <li>Priority support</li>
                                <li>Custom development</li>
                            </ul>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12 text-center" data-aos="fade-up" data-aos-delay="400">
                            <p><em>All packages include kits for the term duration. Annual contracts available with discounts.</em></p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="main-section" id="cta">
                <div className="container">
                    <div className="row">
                        <div className="col-12 text-center" data-aos="fade-up" data-aos-delay="400">
                            <h2>Launch Your Robotics Club</h2>
                        </div>
                        <div className="col-12" data-aos="fade-up" data-aos-delay="600">
                            <div className="contact-form text-center">
                                <iframe
                                    src="https://docs.google.com/forms/d/e/1FAIpQLSec0JyujsBzLY0wkCtfxxr_2a1Bt3hIj1NqsKv_Tp8aKSDycQ/viewform?embedded=true"
                                    title="Google Form for club inquiries"
                                    width="100%"
                                    height="800"
                                    frameBorder="0"
                                    marginHeight={0}
                                    marginWidth={0}
                                >
                                    Loading…
                                </iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Clubs;