import '../styles/globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import Navbar from '../components/Navbar'
// import { Analytics } from '@vercel/analytics/react'; // KALDIRILDI

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <div className="min-h-screen">
          <Navbar />
          <Component {...pageProps} />
          {/* <Analytics /> */} {/* KALDIRILDI */}
        </div>
      </ThemeProvider>
    </AuthProvider>
  )
} 