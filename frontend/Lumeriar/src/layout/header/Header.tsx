import '../../layout/layout.css'
import { Link } from 'react-router-dom'
import logo from '../../assets/LumeriarLogoNew.png'

const Header = () => {
    return (
        <header className="site-header">
            <nav className="site-header__nav" id="navigation">
                <div className="site-header__container">
                    <Link className="site-header__logo" to="/" aria-label="Lumeriar Robotics Home">
                        <img src={logo} alt="Lumeriar Robotics logo" />
                    </Link>
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
                        <li className="nav__item"><Link className="nav__link" to="/">Home</Link></li>
                        <li className="nav__item"><a className="nav__link" href="/pages/about.html">About</a></li>
                        <li className="nav__item nav__item--dropdown">
                            <a className="nav__link" href="/pages/index.html#services">
                                What We Offer <i className="fa fa-caret-down nav__caret"></i>
                            </a>
                            <ul className="nav__dropdown">
                                <li className="nav__dropdown-item"><a className="nav__dropdown-link" href="/pages/curriculums.html">Curriculums</a></li>
                                <li className="nav__dropdown-item"><a className="nav__dropdown-link" href="/pages/clubs.html">Clubs</a></li>
                                <li className="nav__dropdown-item"><a className="nav__dropdown-link" href="/pages/teacherdevelopment.html">Teacher Development</a></li>
                            </ul>
                        </li>
                        <li className="nav__item nav__item--dropdown">
                            <Link to="./events-list" className="nav__link">
                                Events <i className="fa fa-caret-down nav__caret"></i>
                            </Link>
                            <ul className="nav__dropdown">
                                <li className="nav__dropdown-item">
                                    <Link to="./events" className="nav__dropdown-link">Events</Link>
                                </li>
                                <li className="nav__dropdown-item">
                                    <Link to="/leaderboards" className="nav__dropdown-link">Leaderboards</Link>
                                </li>
                                <li className="nav__dropdown-item">
                                    <Link to="/rules-docs" className="nav__dropdown-link">Rules & Docs</Link>
                                </li>
                            </ul>
                        </li>
                        <li className="nav__item"><a className="nav__link" href="/pages/hardwarekits.html">Hardware &amp; Kits</a></li>
                        <li className="nav__item"><a className="nav__link" href="/pages/partners.html">Partners</a></li>
                        <li className="nav__item"><a className="nav__link" href="/pages/contact.html">Contact</a></li>
                        <li className="nav__item"><Link className="nav__link" to="/login">Login</Link></li>
                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default Header;
