
import React, { useState } from 'react';
import axios from 'axios';
import {
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const PaymentForm = () => {
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState('');
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data } = await axios.post('http://localhost:3500/api/payments', {
      orderId,
      amount,
    });

    const clientSecret = data.clientSecret;

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (result.error) {
      alert(`Payment Failed: ${result.error.message}`);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        alert('Payment Successful!');
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white shadow-xl rounded-2xl p-6 space-y-4 border border-gray-200"
    >
      <h2 className="text-2xl font-semibold text-center text-gray-800">Make a Payment</h2>

      <input
        type="text"
        placeholder="Order ID"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        required
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="number"
        placeholder="Amount (USD)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="p-2 border rounded-lg">
        <CardElement />
      </div>
      <button
        type="submit"
        disabled={!stripe}
        className="w-full bg-blue-600 text-black py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        Pay
      </button>
    </form>
  );
};

export default PaymentForm;
