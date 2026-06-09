// src/pages/PublicPages/About.tsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const About = () => {
    // Load TikTok embed script dynamically (only once)
    useEffect(() => {
        if (!document.querySelector('script[src="https://www.tiktok.com/embed.js"]')) {
            const script = document.createElement('script');
            script.src = 'https://www.tiktok.com/embed.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    return (
        <>
            {/* Hero - no image version */}
            <header className="heronoimage" id="hero">
                <div className="container">
                    <h1 className="animated fadeInDown delay-07s">About Lumeriar</h1>
                </div>
            </header>

            {/* Who We Are */}
            <section className="main-section alabaster" id="about-page">
                <div className="container">
                    <div className="row align-center">
                        <div className="grid-2">
                            <figure className="wow fadeInLeft">
                                <img src="../images/CAO presentation.jpeg" alt="Students working with robotics" className="img-fluid" />
                            </figure>
                            <div className="featured-work">
                                <h2>Who We Are</h2>
                                <p>Lumeriar Robotics is an educational innovation organisation based in Durban, South Africa, focused
                                    on preparing students for a future shaped by AI and automation. We design CAPS-aligned curriculums, durable
                                    classroom-ready robotics kits, and practical teacher development programmes that bring hands-on learning
                                    into every classroom.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision & Mission */}
            <section className="main-section" id="about-page">
                <div className="row align-center">
                    <div className="grid-2 featured-work">
                        <div className="featured-box">
                            <h2>Our Vision</h2>
                            <p style={{ paddingLeft: '20px' }}>To be a leading driver of educational innovation, empowering students
                                with industry-relevant skills and knowledge to thrive in an AI-driven world.</p>
                            <h2>Our Mission</h2>
                            <p style={{ paddingLeft: '20px' }}>To implement state-of-the-art vocational programmes that blend
                                academic excellence with practical industry experience, preparing learners for employment and further
                                education.</p>
                        </div>
                        <div >
                            <figure className="wow fadeInLeft">
                                <img src="../images/CAO presentation 2.jpeg" alt="Students working with robotics" className="img-fluid" />
                            </figure>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="main-section alabaster" id="about-page">
                <div className="grid-3" style={{ maxWidth: '1300px', margin: '0 auto' }}>
                    <div className="card no-hover">
                        <h4 className="card-title">Practical Learning</h4>
                        <p className="card-text">Hands-on projects that develop problem-solving, collaboration and technical skills.</p>
                    </div>
                    <div className="card no-hover">
                        <h4 className="card-title">Teacher Empowerment</h4>
                        <p className="card-text">Accessible training and resources so teachers can confidently lead robotics in the classroom.</p>
                    </div>
                    <div className="card no-hover">
                        <h4 className="card-title">Industry Alignment</h4>
                        <p className="card-text">Curriculum and projects mapped to industry needs to ease the transition from learning to work.</p>
                    </div>
                </div>
            </section>

            {/* TikTok Section */}
            <section className="main-section" id="about-page">
                <h2>Follow Us on TikTok</h2>
                <blockquote
                    className="tiktok-embed"
                    cite="https://www.tiktok.com/@lumeriarroboticsclub01"
                    data-unique-id="lumeriarroboticsclub01"
                    data-embed-type="creator"
                    style={{ maxWidth: '780px', minWidth: '288px', margin: '0 auto' }}
                >
                    <section>
                        <a target="_blank" href="https://www.tiktok.com/@lumeriarroboticsclub01?refer=creator_embed" rel="noopener noreferrer">
                            @lumeriarroboticsclub01
                        </a>
                    </section>
                </blockquote>
            </section>

            {/* Call to Action */}
            <section className="main-section alabaster" id="about-page">
                <div className="row">
                    <div className="col-12 text-center wow fadeInUp delay-04s">
                        <h3 style={{ paddingBottom: '30px' }}>Join us in shaping the future of education</h3>
                        <Link to="/contact" className="btn btn-sm">Get in touch</Link>
                    </div>
                </div>
            </section>
        </>
    );
};

export default About;