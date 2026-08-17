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
                        <li className="nav__item"><Link className="nav__link" to="/about">About</Link></li>
                        <li className="nav__item nav__item--dropdown">
                            <Link className="nav__link" to="/#services">
                                What We Offer <i className="fa fa-caret-down nav__caret"></i>
                            </Link>
                            <ul className="nav__dropdown">
                                <li className="nav__dropdown-item"><Link className="nav__dropdown-link" to="/curriculums">Curriculums</Link></li>
                                <li className="nav__dropdown-item"><Link className="nav__dropdown-link" to="/clubs">Clubs</Link></li>
                                <li className="nav__dropdown-item"><Link className="nav__dropdown-link" to="/teacher-development">Teacher Development</Link></li>
                            </ul>
                        </li>
                        <li className="nav__item nav__item--dropdown">
                            <Link to="/events" className="nav__link">
                                Events <i className="fa fa-caret-down nav__caret"></i>
                            </Link>
                            <ul className="nav__dropdown">
                                <li className="nav__dropdown-item">
                                    <Link to="/events-list" className="nav__dropdown-link">Events</Link>
                                </li>
                                <li className="nav__dropdown-item">
                                    <Link to="/leaderboards" className="nav__dropdown-link">Leaderboards</Link>
                                </li>
                                <li className="nav__dropdown-item">
                                    <Link to="/rules-docs" className="nav__dropdown-link">Rules & Docs</Link>
                                </li>
                            </ul>
                        </li>
                        <li className="nav__item"><Link className="nav__link" to="/hardware-kits">Hardware &amp; Kits</Link></li>
                        <li className="nav__item"><Link className="nav__link" to="/partners">Partners</Link></li>
                        <li className="nav__item"><Link className="nav__link" to="/contact">Contact</Link></li>
                        <li className="nav__item"><Link className="nav__link" to="/login">Login</Link></li>
                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default Header;