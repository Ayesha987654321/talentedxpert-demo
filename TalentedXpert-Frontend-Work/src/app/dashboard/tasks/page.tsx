import React from 'react'
import Tasks from '@/components/dashboardComponents/tasks';

const page = () => {
    return (
        <div>
            <Tasks isactive={false} topMenu={true}  />
        </div>
    )
}

export default page