import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentProcessing: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const feeId = searchParams.get('feeId');
    const [status, setStatus] = useState<'PENDING' | 'PAID' | 'FAILED' | 'POLLING'>('POLLING');
    const [message, setMessage] = useState('Verifying your payment...');

    useEffect(() => {
        if (!feeId) {
            setMessage('Invalid Fee ID. Redirecting...');
            setTimeout(() => navigate('/dashboard'), 3000);
            return;
        }

        const pollInterval = setInterval(async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL || '/api'}/fees/status/${feeId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.data.status === 'PAID') {
                    clearInterval(pollInterval);
                    setStatus('PAID');
                    setMessage('Payment Successful! Redirecting to dashboard...');
                    setTimeout(() => navigate('/dashboard'), 2000);
                } else if (response.data.status === 'FAILED') {
                    clearInterval(pollInterval);
                    setStatus('FAILED');
                    setMessage('Payment Failed. Please try again.');
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 3000);

        // Stop polling after 30 seconds
        const timeout = setTimeout(() => {
            clearInterval(pollInterval);
            if (status === 'POLLING') {
                setStatus('FAILED');
                setMessage('Payment confirmation taking longer than expected. Please check your dashboard later or retry.');
            }
        }, 30000);

        return () => {
            clearInterval(pollInterval);
            clearTimeout(timeout);
        };
    }, [feeId, navigate, status]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="p-8 bg-white rounded-xl shadow-lg text-center max-w-md w-full">
                {status === 'POLLING' && (
                    <div className="mb-6">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                )}

                {status === 'PAID' && (
                    <div className="mb-6 text-green-500">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}

                {status === 'FAILED' && (
                    <div className="mb-6 text-red-500">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                )}

                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    {status === 'PAID' ? 'Success!' : status === 'FAILED' ? 'Payment Issue' : 'Processing Payment'}
                </h1>
                <p className="text-gray-600 mb-6">{message}</p>

                {status === 'FAILED' && (
                    <button
                        onClick={() => navigate('/student/dashboard')}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                    >
                        Go to Dashboard
                    </button>
                )}
            </div>
        </div>
    );
};

export default PaymentProcessing;
