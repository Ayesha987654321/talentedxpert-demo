
import React from 'react'
import HtmlData from '../HtmlData/HtmlData';

const NoFound = ({ message }: any) => {
  return (
    <div className='card-bodyy'>
      <HtmlData data={message} className='text-center p-3 text-white'/>
    </div>
  );
}

export default NoFound
