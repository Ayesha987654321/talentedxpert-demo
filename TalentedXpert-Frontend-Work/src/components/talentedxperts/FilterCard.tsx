import React, { FC } from 'react';
import { Icon } from '@iconify/react';

const FilterCard: FC<any> = ({ promoted, disability, setPromoted, setDisability, rating, setRating, setSearch,userType }: any) => {
    return (
        <div className='card-bodyy p-3'>
            <div className='filtersearch d-lg-flex d-md-flex d-sm-flex align-items-center justify-content-between flex-wrap px-2'>
                {/* Left Filters */}
                <div className='filters d-flex flex-wrap align-items-center gap-3'>
                    <select className="form-select form-select-sm" onChange={(e) => setRating(Number(e.target.value))} value={rating}>
                        <option value={0}>Rating</option>
                        <option value={3}>3 stars</option>
                        <option value={4}>4 stars</option>
                        <option value={5}>5 stars</option>
                    </select>
                </div>

                {/* Disability + Promoted + Search Bar */}
                <div className="d-flex align-items-center gap-3 my-1">
                    {/* Disability Checkbox */}
                    {userType=='talent-requestors'? "":
                    <div className="form-check d-flex align-items-center">
                        <input
                            className="form-check-input form-check-lg me-2 bg-dark border-light"
                            type="checkbox"
                            id="disabilityCheck"
                            checked={disability}
                            value={disability}
                            onChange={(e) => setDisability(e.target.checked)}
                            style={{ width: '22px', height: '22px' }}
                        />
                        <label className="form-check-label text-light" htmlFor="disabilityCheck">
                            Disability
                        </label>
                    </div>}
                    
                    {/* Promoted Checkbox */}
                    <div className="form-check d-flex align-items-center">
                        <input
                            className="form-check-input form-check-lg me-2 bg-dark border-light"
                            type="checkbox"
                            id="promotedCheck"
                            checked={promoted}
                            value={promoted}
                            onChange={(e) => setPromoted(e.target.checked)}
                            style={{ width: '22px', height: '22px' }}
                        />
                        <label className="form-check-label text-light" htmlFor="promotedCheck">
                            Promoted
                        </label>
                    </div>

                    {/* Search Bar */}
                    <div className="searchBar">
                        <div className="search-container" style={{ width: '400px', maxWidth: '500px' }}>
                            <input
                                type="text"
                                className='text-light'
                                id="search-bar"
                                placeholder="Search by name here"
                                onChange={(e) => { setSearch(e.target.value) }}
                            />
                            <Icon className='search-icon' icon="clarity:search-line" />
                        </div>
                    </div>
                </div>

            </div>
        </div>


    );
};

export default FilterCard;
