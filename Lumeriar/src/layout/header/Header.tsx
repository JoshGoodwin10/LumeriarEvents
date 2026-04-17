import '../../layout/layout.css'
import { useNavigate } from 'react-router-dom';

const Header = () => {
    return (
        <header className="site-header">
            <nav className="site-header__nav" id="navigation">
                <div className="site-header__container">
                    <a className="site-header__logo" href="/pages/index.html" aria-label="Lumeriar Robotics Home">
                        <img src="/images/Lumeriar Logo New Just Text.png" alt="Lumeriar Robotics logo" />
                    </a>
                    <button
                        className="site-header__toggle"
                        id="navToggle"
                        type="button"
                        aria-label="Toggle navigation"
                        aria-controls="mainNav"
                        aria-expanded="false"
                    >
                        <span className="site-header__toggle-bar"></span>
                        <span className="site-header__toggle-bar"></span>
                        <span className="site-header__toggle-bar"></span>
                    </button>
                    <ul className="nav" id="mainNav">
                        <li className="nav__item"><a className="nav__link" href="/pages/index.html">Home</a></li>
                        <li className="nav__item"><a className="nav__link" href="/pages/about.html">About</a></li>
                        <li className="nav__item nav__item--dropdown">
                            <a className="nav__link" href="/pages/index.html#services">
                                What We Offer <i className="fa fa-caret-down nav__caret"></i>
                            </a>
                            <button onClick={() => navigate('/events')}>Events</button>
                            <ul className="nav__dropdown">
                                <li className="nav__dropdown-item"><a className="nav__dropdown-link" href="/pages/curriculums.html">Curriculums</a></li>
                                <li className="nav__dropdown-item"><a className="nav__dropdown-link" href="/pages/clubs.html">Clubs</a></li>
                                <li className="nav__dropdown-item"><a className="nav__dropdown-link" href="/pages/teacherdevelopment.html">Teacher Development</a></li>
                            </ul>
                        </li>
                        <li className="nav__item nav__item--dropdown">
                            <a className="nav__link" href="/pages/index.html#services">
                                Events <i className="fa fa-caret-down nav__caret"></i>
                            </a>
                            <ul className="nav__dropdown">
                                <li className="nav__dropdown-item"><a className="nav__dropdown-link" href="/pages/curriculums.html">Leaderboards</a></li>
                                <li className="nav__dropdown-item"><a className="nav__dropdown-link" href="/pages/clubs.html">Register</a></li>
                                <li className="nav__dropdown-item"><a className="nav__dropdown-link" href="/pages/teacherdevelopment.html">Winners</a></li>
                                <li className="nav__dropdown-item"><a className="nav__dropdown-link" href="/pages/teacherdevelopment.html">Rules & Docs</a></li>
                            </ul>
                        </li>
                        <li className="nav__item"><a className="nav__link" href="/pages/hardwarekits.html">Hardware &amp; Kits</a></li>
                        <li className="nav__item"><a className="nav__link" href="/pages/partners.html">Partners</a></li>
                        <li className="nav__item"><a className="nav__link" href="/pages/contact.html">Contact</a></li>
                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default Header;