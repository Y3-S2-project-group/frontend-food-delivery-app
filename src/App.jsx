import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginForm } from "./components/auth/login-form";

import Home from "./pages/Home";
import ForgotPassword from "./components/auth/ForgotPassword";
import VerifyOTP from "./components/auth/VerifyOTP";
import ResetPassword from "./components/auth/ResetPassword";
import UserList from "./components/auth/UserList";
import Register from "./components/auth/Register";
import Payment from "./pages/Payment/Payment";


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
            <Route path="/payment" element={<Payment />} />
          </Routes>
        </main>
      </Router>
      <></>
    </>
  );
}

export default App;
