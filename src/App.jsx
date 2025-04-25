import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginForm } from "./components/auth/login-form";

import Home from "./pages/Home";
import ForgotPassword from "./components/auth/ForgotPassword";
import VerifyOTP from "./components/auth/VerifyOTP";
import ResetPassword from "./components/auth/ResetPassword";
import UserList from "./components/auth/UserList";
import Register from "./components/auth/Register";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./pages/Payment/CheckoutForm";

const STRIPE_API_KEY = import.meta.env.VITE_STRIPE_API_KEY;
console.log("STRIPE_API_KEY", STRIPE_API_KEY);

const stripePromise = loadStripe(STRIPE_API_KEY);

function App() {
  return (
    <>
      <Router>
        <main>
          <Routes>
            <Route path="/" element={<LoginForm />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgotPassword" element={<ForgotPassword />} />
            <Route path="/home" element={<Home />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin" element={<UserList />} />
            <Route
              path="/payment"
              element={
                <Elements stripe={stripePromise}>
                  <CheckoutForm />
                </Elements>
              }
            />
          </Routes>
        </main>
      </Router>
      <></>
    </>
  );
}

export default App;
