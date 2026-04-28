import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './layout/Layout'
import Login from './pages/Login'
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import TeamsDashboard from './pages/TeamsDashboard';
import TeamDetail from './pages/TeamDetail';
import CoachesDashboard from './pages/CoachesDashboard';
import SchoolsDashboard from './pages/SchoolsDashboard';
import StudentDashboard from './pages/StudentsDashboard';
import EventsDashboard from './pages/EventsDashboard';
import JudgesDashboard from './pages/JudgesDashboard';

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

    <section id="spacer"></section>
  </>
)

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/index.html" element={<HomePage />} />
          <Route path="/pages/index.html" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />

          {/* Private routes — add as many as you need inside here */}
          <Route element={<PrivateRoute />}>
            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
            {/* <Route path="/profile"   element={<Profile />} /> */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/teams" element={<TeamsDashboard />} />
            <Route path="/school" element={<SchoolsDashboard />} />
            <Route path="/students" element={<StudentDashboard />} />
            <Route path="/coaches" element={<CoachesDashboard />} />
            <Route path="/events" element={<EventsDashboard />} />
            <Route path="/judges" element={<JudgesDashboard />} />
            <Route path="/teams/:id" element={<TeamDetail />} />
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Route>
        </Routes>
      </Layout>
    </AuthProvider>
  )
}

export default App
