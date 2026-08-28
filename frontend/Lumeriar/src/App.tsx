import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './layout/Layout'
import Login from './pages/Login'
import 'bootstrap/dist/css/bootstrap.min.css';
import './layout/public.css';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Overview from './pages/Dashboards/Overview';
import TeamsDashboard from './pages/Dashboards/TeamsDashboard';
import TeamDetail from './pages/Details/TeamDetail';
import CoachesDashboard from './pages/Dashboards/CoachesDashboard';
import SchoolsDashboard from './pages/Dashboards/SchoolsDashboard';
import StudentDashboard from './pages/Dashboards/StudentsDashboard';
import EventsDashboard from './pages/Dashboards/EventsDashboard';
import JudgesDashboard from './pages/Dashboards/JudgesDashboard';
import EventDetail from './pages/Details/EventDetail';
import RequestsDashboard from './pages/Dashboards/RequestsDashboard';
import Leaderboards from './pages/PublicPages/Leaderboards';
import Register from './pages/PublicPages/Register';
import RequestDetail from './pages/Details/RequestDetail';
import AwardsDashboard from './pages/Dashboards/AwardsDashboard';
import RulesDocs from './pages/PublicPages/RulesDocs';
import AdminLayout from './layout/AdminLayout';
import DocumentsDashboard from './pages/Dashboards/DocumentsDashboard';
import EventsList from './pages/PublicPages/EventsList';
import JudgeView from './pages/JudgeView/JudgeView';
import ScoringJudgeView from './pages/JudgeView/ScoringJudgeView';
import HeadJudgeView from './pages/JudgeView/HeadJudgeView';
import About from './pages/PublicPages/About';
import Clubs from './pages/PublicPages/Clubs';
import Contact from './pages/PublicPages/Contact';
import Curriculums from './pages/PublicPages/Curriculums';
import HardwareKits from './pages/PublicPages/HardwareKits';
import Partners from './pages/PublicPages/Partners';
import TeacherDevelopment from './pages/PublicPages/TeacherDevelopment';
import { useState, useEffect } from 'react';
import Events from './pages/PublicPages/Events';
import CoachView from './pages/CoachView/CoachView';
import AppealsList from './pages/JudgeView/AppealsList';

const HomePage = () => {
  // Banner carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { tag: "Events", text: "Come and see us at the CAO Career Expo on 14th March!", link: null },
    { tag: "Curriculums", text: "Find out about our ", link: { href: "/pages/curriculums.html", label: "curriculums" } },
    { tag: "Social Media", text: "Follow us on ", link: { href: "https://www.tiktok.com/@lumeriarobotics", label: "TikTok", external: true } },
    { tag: "Clubs", text: "Start a ", link: { href: "/pages/clubs.html", label: "robotics club" } },
    { tag: "Contact Us", text: "Have a question? ", link: { href: "/pages/contact.html", label: "Get in touch with us" } },
  ];

  const goToSlide = (index: number) => {
    setCurrentSlide((index + slides.length) % slides.length);
  };

  const nextSlide = () => goToSlide(currentSlide + 1);
  const prevSlide = () => goToSlide(currentSlide - 1);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  return (
    <>
      {/* Announcement Banner with working carousel */}
      <div className="announcement-banner">
        <button className="banner-btn" onClick={prevSlide} aria-label="Previous announcement">‹</button>

        <div className="banner-inner">
          <div className="banner-dots">
            {slides.map((_, idx) => (
              <button
                key={idx}
                className={`banner-dot ${idx === currentSlide ? "active" : ""}`}
                onClick={() => goToSlide(idx)}
                aria-label={`Go to announcement ${idx + 1}`}
              />
            ))}
          </div>
          <div className="banner-slides">
            {slides.map((slide, idx) => (
              <div key={idx} className={`banner-slide ${idx === currentSlide ? "active" : ""}`}>
                <span className="banner-tag">{slide.tag}</span>
                <span className="banner-text">
                  {slide.text}
                  {slide.link && (
                    slide.link.external ? (
                      <a href={slide.link.href} target="_blank" rel="noopener noreferrer">{slide.link.label}</a>
                    ) : (
                      <a href={slide.link.href}>{slide.link.label}</a>
                    )
                  )}
                  {slide.link && slide.link.label === "Get in touch with us" && "!"}
                  {slide.link && slide.link.label === "robotics club" && " at your school today!"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button className="banner-btn" onClick={nextSlide} aria-label="Next announcement">›</button>
      </div>

      {/* Hero */}
      <header className="hero" id="hero">
        <div>
          <h2 className='hero-text'>SHAPING FUTURE INNOVATORS</h2>
          <a className="btn" href="#services">See what we offer!</a>
        </div>
      </header>

      <section id="center"></section>

      {/* Services – What We Offer */}
      <section className="main-section alabaster" id="services">
        <div className="container">
          <h2 data-aos="fade-up" data-aos-delay="500">What We Offer</h2>
          <div className="grid-4">
            <div className="card" data-aos="fade-up" data-aos-delay="500">
              <h3 className="card-title mb-3">School Curriculums</h3>
              <img src="../images/curriculums book.png" alt="Curriculums" className="card-img-top" />
              <p className="card-text mb-4">CAPS aligned curriculums and teaching plans catering for Grade R to Grade 12 learners</p>
              <a href="/curriculums" className="btn">Our Curriculms</a>
            </div>
            <div className="card" data-aos="fade-up" data-aos-delay="800">
              <h3 className="card-title mb-3">Hardware and Kits</h3>
              <img src="../images/robot arm.png" alt="Robot Arm" className="card-img-top" />
              <p className="card-text mb-4">Durable, classroom-ready robotics kits designed for repeated use and easy classroom management.</p>
              <a href="/hardware-kits" className="btn">See Our Kits</a>
            </div>
            <div className="card" data-aos="fade-up" data-aos-delay="1000">
              <h3 className="card-title mb-3">Teacher Development</h3>
              <img src="../images/coding.png" alt="Teacher Development" className="card-img-top" />
              <p className="card-text mb-4">Practical training, and classroom resources that help teachers feel confident leading robotics.</p>
              <a href="/teacher-development" className="btn">Teacher Development</a>
            </div>
            <div className="card" data-aos="fade-up" data-aos-delay="1000">
              <h3 className="card-title mb-3">Clubs</h3>
              <img src="../images/book-club.png" alt="Clubs" className="card-img-top" />
              <p className="card-text mb-4">After school robotics clubs that foster innovation and collaboration in preparation for worldwide competitions.</p>
              <a href="/clubs" className="btn">Our Clubs</a>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="main-section" id="about">
        <div className="container">
          <div className="row align-center">
            <div className="grid-2">
              <figure data-aos="fade-left">
                <img src="../images/Event Photo.jpeg" alt="Students working with robotics" className="img-fluid" />
              </figure>
              <div className="featured-work">
                <h2 className="text-center">About Lumeriar</h2>
                <div className="featured-box">
                  <div className="featured-box-col2" data-aos="fade-right" data-aos-delay="200">
                    <h3 className="text-center">Vision:</h3>
                    <p>To become a leading driver of educational innovation, empowering students with industry-relevant skills and knowledge to thrive in an AI-driven world</p>
                  </div>
                </div>
                <div className="featured-box">
                  <div className="featured-box-col2" data-aos="fade-right" data-aos-delay="400">
                    <h3 className="text-center">Mission:</h3>
                    <p>To implement state-of-the-art vocational education programmes that blend academic excellence with practical industry experience, preparing students for employment and further education</p>
                  </div>
                </div>
                <div className="text-center">
                  <a href="/about" className="btn">About Us</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="main-section alabaster" id="partners">
        <div className="container">
          <h2>Our Partners</h2>
          <h6>Trusted partnerships that drive success</h6>
          <div className="grid-4">
            <div className="card bg-light" data-aos="fade-up" data-aos-delay="300">
              <div className="card-img-circle">
                <img src="../images/The_Durban_University_of_Technology_new_log.png" alt="Durban University of Technology" />
              </div>
              <h3 className="card-title">Durban University of Technology</h3>
            </div>
            <div className="card bg-light" data-aos="fade-up" data-aos-delay="600">
              <div className="card-img-circle">
                <img src="../images/DHS-Logo-3-1 (1).png" alt="Durban High School" />
              </div>
              <h3 className="card-title">Durban High School</h3>
            </div>
            <div className="card bg-light" data-aos="fade-up" data-aos-delay="900">
              <div className="card-img-circle">
                <img src="../images/conlog.png" alt="Conlog" />
              </div>
              <h3 className="card-title">Conlog</h3>
            </div>
            <div className="card bg-light" data-aos="fade-up" data-aos-delay="1200">
              <div className="card-img-circle">
                <img src="../images/moses.png" alt="Moses Kotane Institute" />
              </div>
              <h3 className="card-title">Moses Kotane Institute</h3>
            </div>
          </div>
          <a href="/partners" className="btn">View Our Partners</a>
        </div>
      </section>

      {/* Contact */}
      <section className="main-section" id="contact">
        <div className="container">
          <h2>Get In Touch</h2>
          <h6>We'd love to hear from you. Reach out to us today!</h6>
          <div className="contact-info-footer" data-aos="fade-up" data-aos-delay="600">
            <div className="contact-item">
              <div className="contact-details">
                <h3>Email</h3>
                <a href="mailto:info@lumeriar.com">info@lumeriar.com</a>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-details">
                <h3>Phone</h3>
                <a href="tel:+27796035948">079 603 5948</a>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-details">
                <h3>Address</h3>
                <p>3 Adelaide Tambo Dr, Durban North, 4051</p>
              </div>
            </div>
          </div>
          <div className="contact-map" data-aos="fade-right" data-aos-delay="400" style={{ paddingTop: '40px' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3462.5117223353127!2d31.033618675483417!3d-29.791757319604745!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ef7065502e76579%3A0x375fbd604a537878!2s3%20Adelaide%20Tambo%20Dr%2C%20Durban%20North%2C%204051!5e0!3m2!1sen!2sza!4v1769776827637!5m2!1sen!2sza"
              width="100%" height="450" style={{ border: 0, borderRadius: '8px' }} allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      <section id="spacer"></section>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/events-list" element={<EventsList />} />
          <Route path="/events" element={<Events />} />
          <Route path="/leaderboards" element={<Leaderboards />} />
          <Route path="/leaderboard/:eventId" element={<Leaderboards />} />
          <Route path="/register" element={<Register />} />
          <Route path="/rules-docs" element={<RulesDocs />} />
          <Route path="/about" element={<About />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/curriculums" element={<Curriculums />} />
          <Route path="/hardware-kits" element={<HardwareKits />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/teacher-development" element={<TeacherDevelopment />} />

          {/* Private routes (all require authentication) */}
          <Route element={<PrivateRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/dashboard" element={<Overview />} />
              <Route path="/teams" element={<TeamsDashboard />} />
              <Route path="/school" element={<SchoolsDashboard />} />
              <Route path="/students" element={<StudentDashboard />} />
              <Route path="/coaches" element={<CoachesDashboard />} />
              <Route path="/eventsdash" element={<EventsDashboard />} />
              <Route path="/awards" element={<AwardsDashboard />} />
              <Route path="/judges" element={<JudgesDashboard />} />
              <Route path="/requests" element={<RequestsDashboard />} />
              <Route path="/requests/:id" element={<RequestDetail />} />
              <Route path="/teams/:id" element={<TeamDetail />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/documents" element={<DocumentsDashboard />} />
              {/* Catch‑all inside private area: redirect to dashboard */}
              {/* <Route path="*" element={<Navigate to="/dashboard" replace />} /> */}
            </Route>
            <Route path="/judge/view" element={<JudgeView />} />
            <Route path="/scoring/:eventId" element={<ScoringJudgeView />} />
            <Route path="/head-judge/:id" element={<HeadJudgeView />} />
            <Route path="/coach/view" element={<CoachView />} />
            <Route path="/head-judge/:id/appeals" element={<AppealsList />} />
          </Route>
          {/* Optional: catch‑all for non‑private routes (e.g., 404 page) */}
          {/* If you want a 404 for public visitors, add it here (without redirecting to root) */}
        </Routes>

      </Layout>
    </AuthProvider >
  );
}

export default App
