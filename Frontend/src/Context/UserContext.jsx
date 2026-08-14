import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { UserDataContext } from './UserDataContext.js'

const UserContext = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem('token')))

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/v1/users/userProfile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          setUser(response.data?.data ?? null)
        }
      })
      .catch((err) => {
        console.log(err)
        localStorage.removeItem('token')
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <UserDataContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserDataContext.Provider>
  )
}

export default UserContext
