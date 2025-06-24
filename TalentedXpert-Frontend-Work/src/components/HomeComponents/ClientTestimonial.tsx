import { clientTest } from '@/services/helpers/staticdata'
import { Icon } from '@iconify/react/dist/iconify.js'
import Image from 'next/image'
import React from 'react'
import ClientTestimonialSlider from '../common/sliders/ClientTestimonialSlider'

const ClientTestimonial = () => {
  return (
    <section className="promoted_te_section bg_black py-5">
          <div className="container">
            <h2 className="text-white text-center mb-4">{`Clients' Testimonials`}</h2>
            <ClientTestimonialSlider/>

            
          </div>
        </section>
  )
}

export default ClientTestimonial
