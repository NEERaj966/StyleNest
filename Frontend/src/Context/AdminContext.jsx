import { useState } from 'react'
import { AdminDataContext } from './AdminDataContext.js'

const AdminContext = ({ children }) => {
    const [Admin, setAdmin] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    const updateAdmin = (AdminData) => {
        setAdmin(AdminData)
    }

    const value = {
        Admin,
        setAdmin,
        isLoading,
        setIsLoading,
        error,
        setError,
        updateAdmin
    }

    return (
        <AdminDataContext.Provider value={value}>
            {children}
        </AdminDataContext.Provider>
    )
}

export default AdminContext
