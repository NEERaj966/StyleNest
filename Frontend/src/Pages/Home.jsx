import React from 'react'
import { Route, Routes } from 'react-router-dom'
import HeroSection from '../Componants/HeroSection'
import CardSection from '../Componants/CardSection'
import Footer from '../Componants/Footer'
import About from './About'

const Home = () => {
  return (
    <div>
        <HeroSection />
        <CardSection adminPortal={false}/>
        <Footer />
    </div>
  )
}

export default Home
