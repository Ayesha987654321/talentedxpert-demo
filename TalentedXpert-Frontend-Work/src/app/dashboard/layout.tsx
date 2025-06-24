import Sidebar from '@/components/dashboardComponents/sidebar/sidebar'
import React, { FC } from 'react'

const layout: FC<any> = ({ children }) => {
    return (
        <section className='container-fluid forpadding'>
            <div className='row row-cols-2'>
                <Sidebar />
                <div className='col'>
                    <div className='right-side-layout'>
                        {children}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default layout
