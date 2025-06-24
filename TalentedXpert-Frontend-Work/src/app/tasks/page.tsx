import Tasks from '@/components/dashboardComponents/tasks'
import React from 'react'

const page = () => {
  return (
    <Tasks isactive={false} auth={true} topMenu={false}/>
  )
}

export default page
