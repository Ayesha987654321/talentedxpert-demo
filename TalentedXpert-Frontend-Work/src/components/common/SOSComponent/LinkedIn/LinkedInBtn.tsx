import React from 'react'
import { Icon } from '@iconify/react';

const LinkedInBtn = () => {
    const onLinkedInLoad = (caseType: any) => {
        let url = '';
        let redirect_uri = window.location.hostname.startsWith('www') ? `${process.env.DOMAIN_WWW}/signin` : `${process.env.DOMAIN}/signin`; // Your local development URL
        const linkedinClientId = process.env.REACT_APP_LINKEDIN_APPID;
        const linkedinSecret = process.env.REACT_APP_LINKEDIN_SECRET_KEY;
        const scopes = ['email', 'profile', 'openid']; // Specify the scopes you need

        const scopeString = scopes.join(' '); // Join the scopes with a space

        url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${linkedinClientId}&redirect_uri=${redirect_uri}&scope=${scopeString}`;
        const win: Window | null = window.open(url, 'windowname11', 'width=800, height=600');
        if (win) win.focus();
        const pollTimer = window.setInterval(async function () {
            try {
                if (win) {
                    if (win.document.URL.indexOf(redirect_uri) !== -1) {
                        window.clearInterval(pollTimer);
                        const urlSearchParams = new URLSearchParams(win.location.search);
                        let code = urlSearchParams.get('code');
                        let error = urlSearchParams.get('error');
                        let errorDescription = urlSearchParams.get('error_description');
                        const state = caseType;
                        win.close();
                        // window.close();

                        if (code && !error && !errorDescription) {
                            // onNetworkInfo({ code, redirectW: window.location.hostname.startsWith('www') ? true : false, signupType: 'LinkedIn' });
                        } else if (error && errorDescription) {
                            const object = {
                                case: state,
                                platform: 'IN',
                                artifacts: [],
                                isApiOnOff: true,
                                error: { message: errorDescription.split('+').join(' ') },
                            };
                            // onNetworkInfo(object);
                        }
                    }
                }
            } catch (error) {
                // Handle errors here
            }
        }, 100);
    };

    return (
        <button type='button' className='signin-rectangle' onClick={onLinkedInLoad}>
            <Icon icon="flowbite:linkedin-solid" className='text-white fs-20' />
        </button>
    )
}

export default LinkedInBtn