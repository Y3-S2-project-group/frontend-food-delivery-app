// src/stripe.js
import { loadStripe } from '@stripe/stripe-js';

// Replace with your Stripe public key
export const stripePromise = loadStripe('pk_test_51RG3eKPASQD8xT4NyuJUy9STRkaPO4331HdVPMIMMhOWHLglpyYUAMcucvohtSzM92ogq0xND2oK6cRjARA4NyER00Ht6leXIE');
