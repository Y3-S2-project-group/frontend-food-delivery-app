// src/App.js
import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from './stripe';
import PaymentForm from './PaymentForm';

function Payment() {
  return (
    <div className="App">
      <h2>Stripe Payment</h2>
      <Elements stripe={stripePromise}>
        <PaymentForm />
      </Elements>
    </div>
  );
}

export default Payment;
