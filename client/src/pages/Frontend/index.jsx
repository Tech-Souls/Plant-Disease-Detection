import React, { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './Home'
import Header from '../../components/Header'
import About from './About'
import Footer from '../../components/Footer'
import PrivacyPolicies from './PrivacyPolicies'
import TermsConditions from './TermsConditions'
import Contact from './Contact'
import ChatBot from './ChatBot/AIModel.jsx'

export default function Frontend() {
    const { pathname } = useLocation()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

    return (
        <>
            <Header />
            <Routes>
                <Route index element={<Home />} />
                <Route path='/home' element={<Home />} />
                <Route path='/about' element={<About />} />
                <Route path='/contact' element={<Contact />} />
                <Route path='/privacy-policies' element={<PrivacyPolicies />} />
                <Route path='/terms-and-conditions' element={<TermsConditions />} />
                <Route path='/ChatBot' element ={<ChatBot />}/>
            </Routes>
            <Footer />
        </>
    )
}