// src/pages/PublicPages/Curriculums.tsx
import { Link } from 'react-router-dom';

const Curriculums = () => {
    return (
        <>
            {/* Hero */}
            <header className="heronoimage" id="hero">
                <div className="container">
                    <h1 className="animated fadeInDown delay-07s">CAPS-Aligned Curriculums</h1>
                </div>
            </header>

            {/* Overview Section */}
            <section className="main-section alabaster" id="overview">
                <div className="container">
                    <h2 className="wow fadeInUp delay-03s">A Comprehensive Robotics Education</h2>
                    <div className="row align-center">
                        <div className="col-2">
                            <figure className="wow fadeInLeft delay-04s">
                                <img src="../images/Grade 8 Cover.png" alt="Curriculum materials" className="img-fluid" style={{ borderRadius: '20px' }} />
                            </figure>
                        </div>
                        <div className="col-2 wow fadeInRight delay-04s">
                            <p className="mb-4">Our curriculums are meticulously designed to align with the South African CAPS
                                framework, ensuring that robotics and coding education integrates seamlessly with existing
                                educational standards. From foundational concepts in early grades to advanced programming and
                                AI applications in high school, we provide a complete learning journey.</p>
                            <p>Each curriculum module includes detailed lesson plans, student worksheets, assessment rubrics,
                                and teacher guides to ensure successful implementation in any classroom setting.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Grade Levels Section */}
            <section className="main-section" id="grade-levels">
                <div className="container">
                    <h2 className="wow fadeInUp delay-03s">Curriculum by Grade Level</h2>
                    <h6>Tailored learning experiences for every stage of development</h6>

                    <div className="grid-3">
                        <div className="card">
                            <div className="grade-badge">Grade R-3</div>
                            <h3 className="card-title">Foundation Phase</h3>
                            <p className="card-text">Introduction to Coding and Robotics through unplugged, concrete and
                                play-based activities that build early computational thinking using pictures, simple
                                sequences, and tangible coding before moving to more abstract representations</p>
                            <ul className="curriculum-features">
                                <li>Unplugged coding foundations</li>
                                <li>Robotics basics</li>
                                <li>Digital concepts early awareness</li>
                            </ul>
                        </div>
                        <div className="card">
                            <div className="grade-badge">Grade 4-6</div>
                            <h3 className="card-title">Intermediate Phase</h3>
                            <p className="card-text">A structured progression that develops learners to function in a digital
                                world by combining logical/computational thinking with practical technology and engineering
                                skills.</p>
                            <ul className="curriculum-features">
                                <li>Block based algorithms and coding</li>
                                <li>Robotics and Engineering Design Process</li>
                                <li>Digital fluency and communication</li>
                            </ul>
                        </div>
                        <div className="card">
                            <div className="grade-badge">Grade 7-9</div>
                            <h3 className="card-title">Senior Phase</h3>
                            <p className="card-text">STEAM-linked subject that combines programming + robotics + digital
                                concepts to develop learners into creative, ethical problem-solvers who can design, build,
                                and control devices using computational and design thinking.</p>
                            <ul className="curriculum-features">
                                <li>Increased complexity in programming tasks</li>
                                <li>Incorporating sensors and actuators in robotics projects</li>
                                <li>Team-based challenges</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="main-section alabaster" id="features">
                <div className="container">
                    <h2 className="wow fadeInUp delay-03s">What's Included</h2>

                    <div className="grid-3">
                        <div className="card">
                            <div className="feature-icon">📝</div>
                            <h3 className="card-title">Curriculum</h3>
                            <p className="card-text">Complete curriculum packages for each grade phase, including learning
                                objectives, assessment criteria, and teacher support materials.</p>
                        </div>
                        <div className="card">
                            <div className="feature-icon">📚</div>
                            <h3 className="card-title">Lesson Plans</h3>
                            <p className="card-text">Step-by-step teaching guides with clear learning objectives, activities, and
                                timing suggestions for each session.</p>
                        </div>
                        <div className="card">
                            <div className="feature-icon">🎯</div>
                            <h3 className="card-title">CAPS Alignment</h3>
                            <p className="card-text">Every lesson mapped to specific CAPS curriculum outcomes ensuring compliance
                                and seamless integration into existing programmes.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="main-section" id="cta">
                <div className="container">
                    <div className="row">
                        <div className="col-12 text-center wow fadeInUp delay-04s">
                            <h2>Ready to start your robotics journey?</h2>
                            <p className="mb-4">Get in touch to learn more about our curriculum offerings.</p>
                            <Link to="/contact" className="btn">Contact Us</Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Curriculums;