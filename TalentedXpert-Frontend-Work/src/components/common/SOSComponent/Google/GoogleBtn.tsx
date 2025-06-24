import React from 'react'
import { Icon } from '@iconify/react';
import { useGoogleLogin } from '@react-oauth/google'

const GoogleBtn = () => {
    const googleSuccessResponse = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            if (tokenResponse?.code) {
            }
        },
        onError: () => {
            console.error('Google login failed');
        },
        flow: 'auth-code',
        scope: 'https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/userinfo.profile',
    });
        
    return (
        <button type='button' className='signin-rectangle me-2' onClick={() => googleSuccessResponse()}>
            <Icon icon="flat-color-icons:google" />
        </button>
    )
}

export default GoogleBtn