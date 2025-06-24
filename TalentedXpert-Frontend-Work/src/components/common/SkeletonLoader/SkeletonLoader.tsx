import React from 'react';
import { Skeleton } from '@nextui-org/skeleton'; 

const SkeletonLoader = ({ count }: { count: number }) => {
    return (
        <div className="d-flex flex-column gap-3 p-4">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="d-flex flex-column gap-2">
            <Skeleton 
              className="rounded  bg-default-300" 
              style={{ width: '100%', height: '20px', backgroundColor: '#e0e0e0' }} 
            />
            <Skeleton 
              className="rounded  bg-default-300" 
              style={{ width: '60%', height: '20px', backgroundColor: '#e0e0e0' }} 
            />
          </div>
        ))}
      </div>
    );
};

export default SkeletonLoader;
