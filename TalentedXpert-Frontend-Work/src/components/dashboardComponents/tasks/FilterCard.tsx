import React, { FC, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

const FilterCard: FC<any> = ({ promoted, setPromoted, setAmountType, resetFilters, setSearch, setRating, rating, minBudget, maxBudget, setMinBudget, setMaxBudget, amountType, setDisability, disability }: any) => {
    useEffect(() => {
        setRating('');
        setAmountType('');
        setMinBudget('');
        setMaxBudget('');
        setPromoted(true);
    }, [resetFilters]);

    // Handler for budget range selection
    const handleBudgetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === '') {
            setMinBudget('');
            setMaxBudget('');
        } else {
            const [min, max] = value.split('-').map(Number);
            console.log('min max',min, max)
            setMinBudget(String(min));
            setMaxBudget(String(max));
        }
    };

    return (
        <div className='card-bodyy p-3'>
            <div className='filtersearch d-lg-flex d-md-flex d-sm-flex align-items-center justify-content-between flex-wrap px-2'>
                {/* Left Filters */}
                <div className='filters d-flex flex-wrap align-items-center gap-3'>
                    {/* Rating Dropdown */}
                    <select
                        className="form-select form-select-sm"
                        onChange={(e) => setRating(e.target.value)}
                        value={rating}
                    >
                        <option value="">Rating</option>
                        <option value="3">3 stars</option>
                        <option value="4">4 stars</option>
                        <option value="5">5 stars</option>
                    </select>

                    {/* Budget Dropdown */}
                    <select
                        className="form-select form-select-sm"
                        onChange={handleBudgetChange}
                        value={minBudget && maxBudget ? `${minBudget}-${maxBudget}` : ''}
                    >
                        <option value="">Budget</option>
                        <option value="0-500">0 - $500</option>
                        <option value="500-1000">$500 - $1000</option>
                        <option value="1000-5000">$1000 - $5000</option>
                        <option value="5000-10000">$5000 - $10,000</option>
                        <option value="10000-999999">$10000 or above</option>
                    </select>

                    {/* Amount Type Dropdown */}
                    <select
                        className="form-select form-select-sm"
                        onChange={(e) => setAmountType(e.target.value)}
                        value={amountType}
                    >
                        <option value="">Amount</option>
                        <option value="FIXED">Fixed</option>
                        <option value="HOURLY">Hourly</option>
                    </select>
                </div>

                {/* Promoted + Search Bar */}
                <div className="d-flex align-items-center gap-3 my-1">
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
                    </div>

                    {/* Search Bar */}
                    <div className="searchBar">
                        <div className="search-container" style={{ width: '400px', maxWidth: '500px' }}>
                            <input
                                type="text"
                                className='text-light'
                                id="search-bar"
                                placeholder="Search here"
                                onChange={(e) => setSearch(e.target.value)}
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