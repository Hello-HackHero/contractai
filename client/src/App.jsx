import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import Results from './pages/Results'
import Pricing from './pages/Pricing'
import Profile from './pages/Profile'

export default function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <div className="flex flex-col min-h-screen">
                        <Navbar />
                        <main className="flex-1">
                            <Routes>
                                <Route path="/" element={<Landing />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/pricing" element={<Pricing />} />
                                <Route path="/dashboard" element={
                                    <ProtectedRoute><Dashboard /></ProtectedRoute>
                                } />
                                <Route path="/upload" element={
                                    <ProtectedRoute><Upload /></ProtectedRoute>
                                } />
                                <Route path="/results/:id" element={
                                    <ProtectedRoute><Results /></ProtectedRoute>
                                } />
                                <Route path="/profile" element={
                                    <ProtectedRoute><Profile /></ProtectedRoute>
                                } />
                            </Routes>
                        </main>
                        <Footer />
                    </div>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    )
}
