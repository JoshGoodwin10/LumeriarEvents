// src/pages/PublicPages/Contact.tsx
const Contact = () => {
    return (
        <>
            {/* Page Header */}
            <header className="heronoimage" id="hero">
                <div className="container">
                    <h1>Contact Us</h1>
                </div>
            </header>

            {/* Contact Section */}
            <section className="main-section alabaster" id="contact">
                <div className="container">
                    <div className="grid-2">
                        <div className="contact-form text-center" data-aos="fade-up" data-aos-delay="400">
                            <iframe
                                src="https://docs.google.com/forms/d/e/1FAIpQLSePS7TZPoGJMeeKoia9soMeRunfAqbU_79p3snm9bVF9gOk-A/viewform?embedded=true"
                                title="Contact Form"
                                marginWidth={0}
                                style={{ width: '100%', minHeight: '500px', border: 0 }}
                            >
                                Loading…
                            </iframe>
                        </div>
                        <div className="contact-map" data-aos="fade-right" data-aos-delay="400">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3462.5117223353122!2d31.0336186754834!3d-29.79175731960476!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ef7065502e76579%3A0x375fbd604a537878!2s3%20Adelaide%20Tambo%20Dr%2C%20Durban%20North%2C%204051!5e0!3m2!1sen!2sza!4v1771932146070!5m2!1sen!2sza"
                                width="100%"
                                height="450"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Lumeriar Robotics Location"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Details */}
            <section className="main-section" id="contact-details">
                <div className="contact-info-footer">
                    <div className="grid-3">
                        <div className="card" data-aos="fade-up" data-aos-delay="200">
                            <div className="contact-icon"><span>✉</span></div>
                            <div className="contact-details">
                                <h3>Email</h3>
                                <a href="mailto:info@lumeriar.com">info@lumeriar.com</a>
                            </div>
                        </div>
                        <div className="card" data-aos="fade-up" data-aos-delay="400">
                            <div className="contact-icon"><span>☎</span></div>
                            <div className="contact-details">
                                <h3>Phone</h3>
                                <a href="tel:+27796035948">079 603 5948</a>
                            </div>
                        </div>
                        <div className="card" data-aos="fade-up" data-aos-delay="600">
                            <div className="contact-icon"><span>📍</span></div>
                            <div className="contact-details">
                                <h3>Address</h3>
                                <p>3 Adelaide Tambo Dr, Durban North, 4051</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Contact;