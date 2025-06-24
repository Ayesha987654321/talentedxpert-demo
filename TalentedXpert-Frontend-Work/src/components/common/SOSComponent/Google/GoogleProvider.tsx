import { GoogleOAuthProvider } from '@react-oauth/google'
import React from 'react'
import GoogleBtn from './GoogleBtn'

const GoogleProvider = () => {
    return (
        <>
            <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENTID as string}>
                <GoogleBtn />
            </GoogleOAuthProvider>
        </>
    )
}

export default GoogleProvider