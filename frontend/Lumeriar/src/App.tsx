import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './layout/Layout'
import Login from './pages/Login'
import 'bootstrap/dist/css/bootstrap.min.css';
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

const HomePage = () => (
  <>
    <div className="announcement-banner" id="announcementBanner">
      <button className="banner-btn" id="bannerPrev" aria-label="Previous announcement">&#8249;</button>

      <div className="banner-inner">
        <div className="banner-dots" id="bannerDots"></div>
        <div className="banner-slides" id="bannerSlides">

          <div className="banner-slide active">
            <span className="banner-tag">Events</span>
            <span className="banner-text">Come and see us at the CAO Career Expo on 14th March!</span>
          </div>

          <div className="banner-slide">
            <span className="banner-tag">Curriculums</span>
            <span className="banner-text">Find out about our <a
              href="/pages/curriculums.html">curriculums</a></span>
          </div>

          <div className="banner-slide">
            <span className="banner-tag">Social Media</span>
            <span className="banner-text">Follow us on <a href="https://www.tiktok.com/@lumeriarobotics"
              target="_blank">TikTok</a>!</span>
          </div>

          <div className="banner-slide">
            <span className="banner-tag">Clubs</span>
            <span className="banner-text">Start a <a href="/pages/clubs.html">robotics club</a> at your school
              today!</span>
          </div>

          <div className="banner-slide">
            <span className="banner-tag">Contact Us</span>
            <span className="banner-text">Have a question? <a href="/pages/contact.html">Get in touch with
              us</a></span>
          </div>

        </div>
      </div>

      <button className="banner-btn" id="bannerNext" aria-label="Next announcement">&#8250;</button>
    </div>

    <header className="hero" id="hero">
      <div>
        <h2 className='hero-text'>
          SHAPING FUTURE INNOVATORS</h2>

        <a className="btn" href="#services">See what we offer!</a>
      </div>
    </header>

    <section id="center">

    </section>

    <section className="main-section" id="services">
      <div className="container">
        <h2 className="wow fadeIn delay-05s">What We Offer</h2>
        <div className="grid-4">
          <div className="card wow fadeIn delay-05s">
            <h3 className="card-title mb-3">Curriculums</h3>
            <img src="../images/curriculums book.png" alt="Curriculums" className="card-img-top"></img>
            <p className="card-text mb-4">CAPS aligned curriculums and teaching plans catering for Grade R to
              Grade 12 learners</p>
            <a href="/pages/curriculums.html" className="btn">Our Curriculms</a>
          </div>
          <div className="card wow fadeIn delay-08s">
            <h3 className="card-title mb-3">Hardware and Kits</h3>
            <img src="../images/robot arm.png" alt="Robot Arm" className="card-img-top"></img>
            <p className="card-text mb-4">Durable, classroom-ready robotics kits designed for repeated use and
              easy classroom management.</p>
            <a href="/pages/hardwarekits.html" className="btn">See Our Kits</a>
          </div>
          <div className="card wow fadeIn delay-1s">
            <h3 className="card-title mb-3">Teacher Development</h3>
            <img src="../images/coding.png" alt="Teacher Development" className="card-img-top"></img>
            <p className="card-text mb-4">Practical training, and classroom resources that help teachers feel
              confident leading robotics.</p>
            <a href="/pages/teacherdevelopment.html" className="btn">Teacher Development</a>
          </div>
          <div className="card wow fadeIn delay-1s">
            <h3 className="card-title mb-3">Clubs</h3>
            <img src="../images/book-club.png" alt="Clubs" className="card-img-top"></img>
            <p className="card-text mb-4">After school robotics clubs that foster innovation and collaboration
              in preparation for worldwide competitions.
            </p>
            <a href="/pages/clubs.html" className="btn">Our Clubs</a>
          </div>
        </div>
      </div>
    </section>

    <section className="main-section" id="about">
      <div className="container">
        <div className="row align-center">
          <div className="grid-2">
            <figure className="wow fadeInLeft">
              <img src="../images/Event Photo.jpeg" alt="Students working with robotics" className="img-fluid"></img>
            </figure>
            <div className="featured-work">
              <h2 className="text-center">About Lumeriar</h2>
              <div className="featured-box">
                <div className="featured-box-col2 wow fadeInRight delay-02s">
                  <h3 className="text-center">Vision:</h3>
                  <p>To become a leading driver of educational innovation, empowering
                    students with industry-relevant skills and knowledge to thrive in an AI-driven world</p>
                </div>
              </div>
              <div className="featured-box">
                <div className="featured-box-col2 wow fadeInRight delay-04s">
                  <h3 className="text-center">Mission:</h3>
                  <p>To implement state-of-the-art vocational education programmes that blend academic
                    excellence with practical industry experience, preparing students for employment and
                    further education</p>
                </div>
              </div>
              <div className="text-center">
                <a href="/pages/about.html" style={{ alignItems: 'right' }} className="btn">About Us</a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <section className="main-section" id="partners">
      <div className="container">
        <h2>Our Partners</h2>
        <h6>Trusted partnerships that drive success</h6>
        <div className="grid-4">
          <div className="card bg-light wow fadeInUp delay-03s">
            <div className="card-img-circle">
              <img src="../images/The_Durban_University_of_Technology_new_log.png"
                alt="Durban University of Technology" />
            </div>
            <h3 className="card-title">Durban University of Technology</h3>
          </div>
          <div className="card bg-light wow fadeInUp delay-06s">
            <div className="card-img-circle">
              <img src="../images/DHS-Logo-3-1 (1).png" alt="Durban High School" />
            </div>
            <h3 className="card-title">Durban High School</h3>
          </div>
          <div className="card bg-light wow fadeInUp delay-09s">
            <div className="card-img-circle">
              <img src="../images/conlog.png" alt="Conlog" />
            </div>
            <h3 className="card-title">Conlog</h3>
          </div>
          <div className="card bg-light wow fadeInUp delay-12s">
            <div className="card-img-circle">
              <img src="../images/moses.png" alt="Moses Kotane Institute" />
            </div>
            <h3 className="card-title">Moses Kotane Institute</h3>
          </div>
        </div>
        <a href="/pages/partners.html" className="btn">View Our Partners</a>
      </div>
    </section>

    <section className="main-section wow fadeInUp" id="contact">
      <div className="container">
        <h2>Get In Touch</h2>
        <h6>We'd love to hear from you. Reach out to us today!</h6>
        <div className="contact-info-footer wow fadeInUp delay-06s">
          <div className="contact-item">
            <div className="contact-icon"><span>✉</span></div>
            <div className="contact-details">
              <h3>Email</h3>
              <a href="mailto:info@lumeriar.com">info@lumeriar.com</a>
            </div>
          </div>
          <div className="contact-item">
            <div className="contact-icon"><span>☎</span></div>
            <div className="contact-details">
              <h3>Phone</h3>
              <a href="tel:+27796035948">079 603 5948</a>
            </div>
          </div>
          <div className="contact-item">
            <div className="contact-icon"><span>📍</span></div>
            <div className="contact-details">
              <h3>Address</h3>
              <p>3 Adelaide Tambo Dr, Durban North, 4051</p>
            </div>
          </div>
        </div>
        <div className="contact-map wow fadeInRight delay-04s" style={{ paddingTop: '40px' }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3462.5117223353127!2d31.033618675483417!3d-29.791757319604745!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ef7065502e76579%3A0x375fbd604a537878!2s3%20Adelaide%20Tambo%20Dr%2C%20Durban%20North%2C%204051!5e0!3m2!1sen!2sza!4v1769776827637!5m2!1sen!2sza"
            width="100%" height="450" style={{ border: 0, borderRadius: '8px' }} allowFullScreen loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </div>
    </section>

    <section id="spacer"></section>
  </>
)

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/index.html" element={<HomePage />} />
          <Route path="/pages/index.html" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/events-list" element={<EventsList />} />
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
              <Route path="/events" element={<EventsDashboard />} />
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
          </Route>
          {/* Optional: catch‑all for non‑private routes (e.g., 404 page) */}
          {/* If you want a 404 for public visitors, add it here (without redirecting to root) */}
        </Routes>

      </Layout>
    </AuthProvider >
  );
}

export default App
