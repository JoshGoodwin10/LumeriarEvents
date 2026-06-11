// src/pages/PublicPages/Partners.tsx
import { Link } from 'react-router-dom';

const Partners = () => {
    return (
        <>
            {/* Hero */}
            <header className="heronoimage" id="hero">
                <div className="container">
                    <h1>Our Partners</h1>
                </div>
            </header>

            {/* Overview Section */}
            <section className="main-section alabaster" id="overview">
                <div className="container">
                    <h2 data-aos="fade-up" data-aos-delay="300">Collaboration for Impact</h2>
                    <div className="row">
                        <div className="col-12 text-center" data-aos="fade-up" data-aos-delay="400">
                            <p style={{ maxWidth: '800px', margin: '0 auto' }}>We believe that meaningful educational transformation
                                happens through partnership. By working closely with universities, schools, industry leaders,
                                and educational institutions, we create pathways that connect classroom learning to real-world
                                opportunity. Our partnerships ensure our programmes stay relevant, impactful, and aligned with
                                the needs of learners, educators, and employers alike.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partners Grid Section */}
            <section className="main-section" id="partner-grid">
                <div className="container">
                    <h2 data-aos="fade-up" data-aos-delay="300">Who We Work With</h2>
                    <h6 data-aos="fade-up" data-aos-delay="400">Trusted partnerships that drive success</h6>

                    <div className="grid-4">
                        <div className="card bg-light" data-aos="fade-up" data-aos-delay="200">
                            <div className="card-img-circle">
                                <img src="../images/The_Durban_University_of_Technology_new_log.png"
                                    alt="Durban University of Technology" />
                            </div>
                            <h3 className="card-title">Durban University of Technology</h3>
                            <p className="card-text italic mb-3">"Lumeriar's robotics programmes provide a strong foundation
                                for students entering our engineering and technology faculties. Their CAPS-aligned approach
                                ensures learners arrive well-prepared for tertiary study."</p>
                            <div className="partnership-type">Academic Partner</div>
                        </div>

                        <div className="card bg-light" data-aos="fade-up" data-aos-delay="400">
                            <div className="card-img-circle">
                                <img src="../images/DHS-Logo-3-1 (1).png" alt="Durban High School" />
                            </div>
                            <h3 className="card-title">Durban High School</h3>
                            <p className="card-text italic mb-3">"The robotics curriculum has transformed how our students
                                engage with STEM subjects. Teachers report higher enthusiasm, and students develop
                                real-world problem-solving skills that extend far beyond the classroom."</p>
                            <div className="partnership-type">Educational Partner</div>
                        </div>

                        <div className="card bg-light" data-aos="fade-up" data-aos-delay="600">
                            <div className="card-img-circle">
                                <img src="../images/conlog.png" alt="Conlog" />
                            </div>
                            <h3 className="card-title">Conlog</h3>
                            <p className="card-text italic mb-3">"Partnering with Lumeriar helps us identify and nurture
                                technical talent early. Their vocational programmes give learners practical skills that make
                                them job-ready from day one—exactly what industry needs."</p>
                            <div className="partnership-type">Industry Partner</div>
                        </div>

                        <div className="card bg-light" data-aos="fade-up" data-aos-delay="800">
                            <div className="card-img-circle">
                                <img src="../images/moses.png" alt="Moses Kotane Institute" />
                            </div>
                            <h3 className="card-title">Moses Kotane Institute</h3>
                            <p className="card-text italic mb-3">"The teacher training provided by Lumeriar has been
                                instrumental in building our staff's confidence and competence in delivering robotics
                                education. The ongoing support ensures sustained impact."</p>
                            <div className="partnership-type">Training Partner</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partnership Benefits Section */}
            <section className="main-section alabaster" id="benefits">
                <div className="container">
                    <h2 data-aos="fade-up" data-aos-delay="300">Why Partner with Us?</h2>
                    <div className="grid-4">
                        <div className="card no-hover" data-aos="fade-up" data-aos-delay="200">
                            <div className="feature-icon">🎓</div>
                            <h3 className="card-title">For Universities</h3>
                            <p className="card-text">Access a pipeline of well-prepared students with foundational robotics and
                                coding skills. Collaborate on curriculum alignment and research opportunities.</p>
                        </div>

                        <div className="card no-hover" data-aos="fade-up" data-aos-delay="400">
                            <div className="feature-icon">🏫</div>
                            <h3 className="card-title">For Schools</h3>
                            <p className="card-text">Implement proven, CAPS-aligned programmes with full teacher support,
                                quality kits, and ongoing professional development—no prior robotics experience needed.</p>
                        </div>

                        <div className="card no-hover" data-aos="fade-up" data-aos-delay="600">
                            <div className="feature-icon">🏭</div>
                            <h3 className="card-title">For Industry</h3>
                            <p className="card-text">Shape the future workforce by influencing curriculum content, offering
                                mentorship, and gaining early access to skilled, motivated young talent.</p>
                        </div>

                        <div className="card no-hover" data-aos="fade-up" data-aos-delay="800">
                            <div className="feature-icon">🤝</div>
                            <h3 className="card-title">For NGOs & Funders</h3>
                            <p className="card-text">Invest in scalable, measurable educational impact. Our programmes are
                                designed for sustainability, accountability, and demonstrable learning outcomes.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partnership Types Section */}
            <section className="main-section" id="partnership-types">
                <div className="container">
                    <h2 data-aos="fade-up" data-aos-delay="300">Partnership Opportunities</h2>
                    <div className="grid-3">
                        <div className="card" data-aos="fade-up" data-aos-delay="200">
                            <h3 className="card-title mb-3">Curriculum Co-Development</h3>
                            <p className="card-text">Work with us to develop specialized modules, industry-aligned content, or
                                advanced electives that meet specific learning or workforce needs.</p>
                        </div>

                        <div className="card" data-aos="fade-up" data-aos-delay="400">
                            <h3 className="card-title mb-3">Teacher Training & Capacity Building</h3>
                            <p className="card-text">Support schools and districts by co-funding or co-delivering professional
                                development programmes that build long-term teaching capacity.</p>
                        </div>

                        <div className="card" data-aos="fade-up" data-aos-delay="600">
                            <h3 className="card-title mb-3">Kit Sponsorship & Distribution</h3>
                            <p className="card-text">Sponsor robotics kits for under-resourced schools, expanding access to
                                high-quality STEM education and creating lasting social impact.</p>
                        </div>
                    </div>

                    <div className="grid-3">
                        <div className="card" data-aos="fade-up" data-aos-delay="200">
                            <h3 className="card-title mb-3">Mentorship & Work Exposure</h3>
                            <p className="card-text">Provide students with industry mentorship, site visits, internships, or
                                project challenges that connect classroom learning to real-world careers.</p>
                        </div>

                        <div className="card" data-aos="fade-up" data-aos-delay="400">
                            <h3 className="card-title mb-3">Research & Innovation</h3>
                            <p className="card-text">Collaborate on educational research, pilot innovative teaching methods, or
                                explore the effectiveness of robotics in developing critical 21st-century skills.</p>
                        </div>

                        <div className="card" data-aos="fade-up" data-aos-delay="600">
                            <h3 className="card-title mb-3">Strategic Alliances</h3>
                            <p className="card-text">Join forces on large-scale initiatives, policy advocacy, or systemic
                                educational transformation projects that require multi-stakeholder collaboration.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="main-section alabaster" id="cta">
                <div className="container">
                    <div className="row">
                        <div className="col-12 text-center" data-aos="fade-up" data-aos-delay="400">
                            <h2>Become a Partner</h2>
                            <p className="mb-4">Let's explore how we can work together to create meaningful educational impact.</p>
                            <Link to="/contact" className="btn">Get in Touch</Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Partners;