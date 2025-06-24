import GoogleMap from '@/components/dashboardComponents/FormTask/GoogleMap'
import React, { useState } from 'react'

const Address = ({setValue, errors, register, getStates, states, getCities, cities, countries, currentLocation, type}:any) => {
   

        const handleLocationSelect = (lat: number, lng: number) => {
            // Do something with the coordinates
            setValue('latitude', String(lat))
            setValue('longitude', String(lng))
        };
    return (
        <div>
            <div className='row'>
                <div className='col-md-6 mt-3'>
                    <div className="mb-3">
                        <label htmlFor="exampleFormControlInput1233" className={`form-label text-${type? 'white':'dark'} fs-14`}>Pin Your Location :</label>
                        {/* <input type="text" className="form-control invert text-dark border-0" id="exampleFormControlInput1" placeholder="Pin Location" /> */}
                        {/* <GoogleMap address="1600 Amphitheatre Parkway, Mountain View, CA" /> */}

                        <GoogleMap
                            latitude={currentLocation.latitude || 24.99816}
                            longitude={currentLocation.longitude || 56.27207}
                            onLocationSelect={handleLocationSelect}
                        />

                    </div>

                </div>
                <div className='col-md-6'>

                    <div className='mb-3'>

                        {
                            errors.taskType && (
                                <div className="text-danger pt-2">{errors.taskType.message}</div>
                            )
                        }

                    </div>



                    <div className="mb-3">
                        <label htmlFor="exampleFormControlInput1" className={`form-label text-${type? 'white':'dark'} fs-14`}>Address :</label>
                        <input {...register('address')} type="text" className="form-control invert text-dark border-0" id="exampleFormControlInput1" placeholder="Address" />
                        {
                            errors.address && (
                                <div className="text-danger pt-2">{errors.address.message}</div>
                            )
                        }
                    </div>

                    <div className="mb-3">
                        <label className={`form-label text-${type? 'white':'dark'} fs-14`}>Country :</label>
                        <select {...register('country')} className="form-select invert text-dark border-0 text-tertiary" aria-label="Default select example" onChange={(e) => {
                            getStates(e?.target?.value !== "" ? Number(e?.target?.value) : null, null)
                        }}>
                            <option value={''}>Country</option>
                            {countries?.map((country: any) => (<option key={country?.id} value={country?.id}>{country?.name}</option>))}
                        </select>
                        {
                            errors.country && (
                                <div className="text-danger pt-2">{errors.country.message}</div>
                            )
                        }
                    </div>
                    <div className="mb-3">

                        <label className={`form-label text-${type? 'white':'dark'} fs-14`}>State/Province :</label>
                        <select {...register('state')} className="form-select invert text-dark border-0 text-tertiary" aria-label="Default select example" onChange={(e) => {

                            getCities(e?.target?.value !== "" ? Number(e?.target?.value) : null, null)
                        }}>
                            <option value={''}>State</option>
                            {states?.map((state: any) => (<option key={state?.id} value={state?.id}>{state?.name}</option>))}
                        </select>
                        {
                            errors.state && (
                                <div className="text-danger pt-2">{errors.state.message}</div>
                            )
                        }
                    </div>
                    <div className="mb-3">
                        <label htmlFor="exampleFormControlInput1" className={`form-label text-${type? 'white':'dark'} fs-14`}>City/Town :</label>
                        {/* <input {...register('city')} type="text" className="form-control invert text-dark border-0" id="exampleFormControlInput1" placeholder="City" /> */}
                        <select {...register('city')} className="form-select invert text-dark border-0 text-tertiary" aria-label="Default select example" >
                            <option value={''}>City</option>
                            {cities?.map((city: any) => (<option key={city?.id} value={city?.id}>{city?.name}</option>))}
                        </select>
                        {
                            errors.city && (
                                <div className="text-danger pt-2">{errors.city.message}</div>
                            )
                        }
                    </div>
                    <div className="mb-3">
                        <label className={`form-label text-${type? 'white':'dark'} fs-14`}>ZIP Code/ Postal Code :</label>
                        <input {...register('zip')} type="text" className="form-control invert text-dark border-0" aria-label="Default select example" placeholder="Zip Code" />


                        {
                            errors.zip && (
                                <div className="text-danger pt-2">{errors.zip.message}</div>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Address
