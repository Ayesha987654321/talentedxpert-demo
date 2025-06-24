import React, { FC } from 'react'
import { Icon } from '@iconify/react';

const FilterCard: FC<any> = ({ name, setName }) => {
    return (
        <div className='card-bodyy p-3'>
            <div className='filtersearch d-lg-flex d-md-flex d-sm-flex align-items-center justify-content-between flex-wrap px-2'>
                <div className='filters d-flex flex-wrap align-items-center gap-3'>
                </div>

                {/* Search Bar */}
                <div className="searchBar my-1">
                    <div className="search-container">
                        <input type="text" className='text-light' id="search-bar" placeholder="Search by name" value={name} onChange={(e) => setName(e.target.value)} />
                        <Icon className='search-icon' icon="clarity:search-line" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FilterCard