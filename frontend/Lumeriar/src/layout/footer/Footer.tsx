import '../../layout/layout.css'

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer-grid">
                <div className="footer-col">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="/pages/index.html">Home</a></li>
                        <li><a href="/pages/about.html">About Us</a></li>
                        <li><a href="/pages/partners.html">Our Partners</a></li>
                        <li><a href="/pages/contact.html">Contact Us</a></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h4>Our Services</h4>
                    <ul>
                        <li><a href="/pages/clubs.html">Clubs</a></li>
                        <li><a href="/pages/curriculums.html">Curriculums</a></li>
                        <li><a href="/pages/hardwarekits.html">Hardware & Kits</a></li>
                        <li><a href="/pages/teacherdevelopment.html">Teacher Development</a></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h4>Reach Us</h4>
                    <p>✉ <a href="mailto:info@lumeriar.com">info@lumeriar.com</a></p>
                    <p>☎ <a href="tel:+27796035948">079 603 5948</a></p>
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