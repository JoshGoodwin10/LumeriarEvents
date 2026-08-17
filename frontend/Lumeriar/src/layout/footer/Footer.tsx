import '../../layout/layout.css'

const Footer = () => {
    return (
        <footer className="footer">
            <div className="grid-4">
                <div className="footer-col">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="/about">About Us</a></li>
                        <li><a href="/partners">Our Partners</a></li>
                        <li><a href="/contact">Contact Us</a></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h4>Our Services</h4>
                    <ul>
                        <li><a href="/clubs">Clubs</a></li>
                        <li><a href="/curriculums">Curriculums</a></li>
                        <li><a href="/hardware-kits">Hardware & Kits</a></li>
                        <li><a href="/teacher-development">Teacher Development</a></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h4>Events</h4>
                    <ul>
                        <li><a href="/events-list">Events</a></li>
                        <li><a href="/leaderboards">Leaderboards</a></li>
                        <li><a href="/rules-docs">Rules and Docs</a></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h4>Reach Us</h4>
                    <p><a href="mailto:info@lumeriar.com">info@lumeriar.com</a></p>
                    <p> <a href="tel:+27796035948">079 603 5948</a></p>
                    <p><i className="fa-brands fa-tiktok"></i><a
                        href="https://www.tiktok.com/@lumeriarroboticsclub01?refer=creator_embed">TikTok</a></p>
                </div>
            </div>
            <div className="footer-bottom">
                <div className="container">
                    <span className="copyright"><a>© 2026 Lumeriar Robotics</a>. All Rights
                        Reserved.</span>
                </div>
            </div>
        </footer >
    );
};

export default Footer;