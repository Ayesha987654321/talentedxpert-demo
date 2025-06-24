import { DOTS, usePagination } from '@/hooks/usePagination';
import { listingLimitEnum } from '@/services/enums/enums'
import React from 'react'

export const Pagination = (props: any) => {
    const { limit, count, page, onLimitChange, onPageChange, siblingCount } = props

    const paginationRange: any = usePagination({
        currentPage: page,
        limit,
        totalCount: count,
        siblingCount
    });

    if (page === 0 || paginationRange?.length < 1) {
        return null;
    }

    const onNext = () => {
        page === lastPage ? null : onPageChange(page + 1);
    };

    const onPrevious = () => {
        page === 1 ?  null : onPageChange(page - 1);
    };

    let lastPage = paginationRange && paginationRange[paginationRange?.length - 1];

    return (
        <div className='pagiandnumber d-flex flex-wrap justify-content-around justify-content-md-between align-items-baseline py-2 px-lg-5 px-2 bg-black'>
            <div className='Numbring d-flex align-items-center'>
                <span>Showing</span> <span className="mx-2">
                    <select name="limit" className="form-select form-select-sm" value={limit} onChange={(e) => onLimitChange(Number(e?.target?.value))}>
                        {Object.keys(listingLimitEnum).map(key => {
                            const value = listingLimitEnum[key as keyof typeof listingLimitEnum];
                            return (
                                <option key={value} value={value}>
                                    {value}
                                </option>
                            );
                        })}
                    </select>
                </span>  <span>entries</span>
            </div>
            <div className='pagination'>
                <nav aria-label="Page navigation example">
                    <ul className="pagination py-2 my-0 cursor">
                        <li className={page === 1 ? 'page-item disabled' : 'page-item'} onClick={onPrevious}>
                            <span className='page-link' aria-hidden="true">&laquo;</span>
                        </li>
                        {paginationRange && paginationRange?.length > 0 && paginationRange?.map((pageNumber: any) => {

                            if (pageNumber === DOTS) {
                                return <li className="page-item dots ms-1" key={pageNumber}>&#8230;</li>;
                            }

                            return (
                                <li
                                    className={pageNumber === page ? `border page-item active ms-1` : `border page-item ms-1`}
                                    onClick={() => onPageChange(pageNumber)}
                                    key={pageNumber}
                                >
                                    <span className="page-link">{pageNumber}</span>
                                </li>
                            );
                        })}
                        <li className={page === lastPage ? 'page-item disabled ms-1' : 'page-item ms-1'}  onClick={onNext}>
                            <span className='page-link' aria-hidden="true">&raquo;</span>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    )
}

