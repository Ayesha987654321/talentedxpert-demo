import React, { FC } from 'react'
import { Icon } from '@iconify/react';

const RatingStar: FC<any> = ({ rating }) => {
    return (
        <div className="rating">
            {[...Array(5)].map((_, index) => (
                <Icon
                    key={index}
                    icon="material-symbols-light:kid-star"
                    className={`text-light ${index < rating ? "rated" : ""}`}
                />
            ))}
            
        </div>
    )
}

export default RatingStar