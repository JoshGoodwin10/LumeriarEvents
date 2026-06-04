// src/pages/PublicPages/TeacherDevelopment.tsx
import { Link } from 'react-router-dom';

const TeacherDevelopment = () => {
    return (
        <>
            {/* Hero */}
            <header className="heronoimage" id="hero">
                <div className="container">
                    <h1 className="animated fadeInDown delay-07s">Teacher Development</h1>
                </div>
            </header>

            {/* Overview Section */}
            <section className="main-section alabaster" id="overview">
                <div className="container">
                    <h2 className="wow fadeInUp delay-03s">Supporting Teachers Every Step</h2>
                    <div className="row align-center">
                        <div className="col-2">
                            <figure className="wow fadeInLeft delay-04s">
                                <img src="../images/car on table.jpeg" alt="Teacher training" className="img-fluid" />
                            </figure>
                        </div>
                        <div className="col-2 wow fadeInRight delay-04s">
                            <p className="mb-4">We believe that confident, well-supported teachers are the key to successful
                                robotics education. Our teacher development programmes provide the technical knowledge,
                                pedagogical strategies, and ongoing support educators need to deliver engaging, effective
                                robotics lessons—even without prior coding or engineering experience.</p>
                            <p>From initial onboarding to advanced facilitation techniques, we walk alongside teachers,
                                building their capacity and confidence to inspire the next generation of innovators.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Training Programmes Section */}
            <section className="main-section" id="programmes">
                <div className="container">
                    <h2 className="wow fadeInUp delay-03s">Our Training Programmes</h2>
                    <h6>Flexible options to meet your school's needs</h6>

                    <div className="row">
                        <div className="col-3 wow fadeInUp delay-03s">
                            <div className="card">
                                <h3 className="card-title">Foundation Workshop</h3>
                                <div className="programme-duration">1-Day Intensive</div>
                                <p className="card-text mb-3">Perfect for schools just starting their robotics journey. Covers
                                    basic robotics concepts, kit assembly, curriculum overview, and classroom management
                                    strategies.</p>
                                <ul className="programme-outcomes">
                                    <li>Hands-on kit familiarization</li>
                                    <li>Curriculum walkthrough</li>
                                    <li>Basic troubleshooting</li>
                                    <li>Resource access setup</li>
                                </ul>
                            </div>
                        </div>

                        <div className="col-3 wow fadeInUp delay-06s">
                            <div className="card">
                                <h3 className="card-title">Intermediate Course</h3>
                                <div className="programme-duration">3-Day Programme</div>
                                <p className="card-text mb-3">Deepens technical and pedagogical skills. Teachers learn advanced
                                    programming, project design, assessment methods, and differentiation strategies for mixed
                                    abilities.</p>
                                <ul className="programme-outcomes">
                                    <li>Block & text-based coding</li>
                                    <li>Project-based learning design</li>
                                    <li>Assessment & rubrics</li>
                                    <li>Differentiation techniques</li>
                                </ul>
                            </div>
                        </div>

                        <div className="col-3 wow fadeInUp delay-09s">
                            <div className="card">
                                <h3 className="card-title">Advanced Facilitation</h3>
                                <div className="programme-duration">5-Day Intensive</div>
                                <p className="card-text mb-3">For experienced teachers ready to lead at the highest level. Includes
                                    advanced robotics concepts, curriculum customization, and train-the-trainer
                                    methods.</p>
                                <ul className="programme-outcomes">
                                    <li>Advanced programming concepts</li>
                                    <li>Advanced sensor integration</li>
                                    <li>Curriculum adaptation</li>
                                    <li>Peer training skills</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* What Teachers Say Section */}
            <section className="main-section alabaster" id="testimonials">
                <div className="container">
                    <h2 className="wow fadeInUp delay-03s">What Teachers Say</h2>
                    <h6>Hear from educators who we've worked with</h6>

                    <div className="row">
                        <div className="col-3 wow fadeInUp delay-04s">
                            <div className="card bg-light">
                                <p className="card-text italic mb-3">"I had zero coding experience before this training. Now I'm
                                    confidently teaching Grade 6 robotics and my students are building incredible projects. The
                                    ongoing support makes all the difference."</p>
                            </div>
                        </div>

                        <div className="col-3 wow fadeInUp delay-06s">
                            <div className="card bg-light">
                                <p className="card-text italic mb-3">"The curriculum is so well-structured that even as a new
                                    teacher, I felt prepared from day one. The lesson plans are detailed but flexible, which is
                                    perfect for my diverse classroom."</p>
                            </div>
                        </div>

                        <div className="col-3 wow fadeInUp delay-08s">
                            <div className="card bg-light">
                                <p className="card-text italic mb-3">"What I appreciate most is that the training doesn't just
                                    focus on technical skills—it genuinely helps me become a better facilitator. My students
                                    are more engaged than ever."</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Resources Section */}
            <section className="main-section" id="resources">
                <div className="container">
                    <h2 className="wow fadeInUp delay-03s">Resources & Support</h2>
                    <div className="row">
                        <div className="col-3 wow fadeInUp delay-04s">
                            <div className="feature-icon">📚</div>
                            <h3 className="card-title">Resource Library</h3>
                            <p className="card-text">Access hundreds of lesson plans, activity cards, video tutorials, and
                                troubleshooting guides available 24/7 online.</p>
                        </div>

                        <div className="col-3 wow fadeInUp delay-06s">
                            <div className="feature-icon">👥</div>
                            <h3 className="card-title">Teacher Community</h3>
                            <p className="card-text">Join a network of educators sharing ideas, challenges, and successes. Monthly
                                meetups and online forums keep you connected.</p>
                        </div>

                        <div className="col-3 wow fadeInUp delay-1s">
                            <div className="feature-icon">📞</div>
                            <h3 className="card-title">Direct Support</h3>
                            <p className="card-text">Email, phone, and video call support available during school hours. Quick
                                response times ensure you're never stuck.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="main-section alabaster" id="cta">
                <div className="container">
                    <div className="row">
                        <div className="col-12 text-center wow fadeInUp delay-04s">
                            <h2>Ready to Empower Your Teachers?</h2>
                            <p className="mb-4">Book a training session or learn more about our professional development
                                programmes.</p>
                            <Link to="/contact" className="btn">Schedule Training</Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default TeacherDevelopment;