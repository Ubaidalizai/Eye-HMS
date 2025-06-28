import React, { useState } from 'react';
import { BASE_URL } from '../config';
import { toast } from 'react-toastify';

const MoveSalesToLog = ({ onTransferSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error('Enter a valid amount to transfer.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/pharmacy-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to move sales amount');
      }

      toast.success('Sales amount moved to log successfully.');
      setAmount('');
      onTransferSuccess?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='mt-6 bg-white p-4 border rounded shadow-sm'>
      <h3 className='text-lg font-semibold mb-2'>
        Transfer Sale Amount to Log
      </h3>
      <div className='flex items-center gap-2'>
        <input
          type='number'
          placeholder='Enter amount to transfer'
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className='border p-2 rounded w-full max-w-xs'
        />
        <button
          onClick={handleTransfer}
          className='bg-blue-600 text-white px-4 py-2 rounded'
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Transfer'}
        </button>
      </div>
    </div>
  );
};

export default MoveSalesToLog;
