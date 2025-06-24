import React from 'react'
import ConnectStripeBtn from '@/components/common/connectStripeBtn/ConnectStripeBtn';

const PaymentInformation = () => {
    return (
        <div>
            <div className='card'>
                <div className='viewtask-card card-header px-4 bg-gray'>
                    <div className='card-left-heading '>
                        <h3>Payment Information</h3>
                    </div>
                </div>
                <div className='card-bodyy paymentinformation'>
                    <h3>Payment information details is telling you one thing but your customers or employees are telling you another?</h3>
                    <p>
                        {`I can understand why the idea of big data has grown so rapidly. The value of data is very easy to sell. It’s a clear, almost mathematical way to analyse trends and drive marginal gains within a business or product. But equally, I would argue it’s also a lazy strategy if used in silo. What if the fundamental approach the business or a product is taking is wrong? Are you just driving changes towards the wrong end?
                        This is where consumer experience or ‘consumer love’ is key. Creating a product that people relate to; that fulfils a real need or desire is critical to building a long-lasting, successful business. But herein lies the problem — how do you measure emotional response towards your product?
                        `}
                    </p>
                    <h3 className='pt-4'>Stripe Account information (for US only)</h3>
                    <ConnectStripeBtn isSetting={false} />
                </div>

            </div>
        </div>
    )
}

export default PaymentInformation