import React from 'react'
import { useAuthContext } from './contexts/AuthContext'
import Routes from './pages/Routes'
import Loader from './components/Loader'

export default function App() {

    const { loading } = useAuthContext()

    return (
        <div className='overflow-x-hidden'>
            {
                loading ? <Loader /> : <Routes />
            }
        </div>
    )
}