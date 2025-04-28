import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginForm } from "./components/auth/login-form";

import Home from "./pages/Home"
import ForgotPassword from "./components/auth/ForgotPassword";
import VerifyOTP from "./components/auth/VerifyOTP";
import ResetPassword from "./components/auth/ResetPassword";
import UserList from "./components/auth/UserList";
import Register from "./components/auth/Register";
import Placeorder from "./components/order/Placeorder";
import OrderConfirmation from "./components/order/OrderConfirmation";

import RestaurantForm from "./components/restaurantService/RestaurantForm";
import RestaurantList from "./components/restaurantService/RestaurantList";
import RestaurantVerification from "./components/RestaurantService/RestaurantVerification";
import RestaurantMenu from "./components/RestaurantService/MenuAddForm";
import RestaurantMenuList from "./components/RestaurantService/MenuView";
import ShopPage from "./components/RestaurantService/ShopPage";
import UserOrders from "./components/order/Userorder";


import OrderDetailsPage from "./components/order/OrderDetailsPage";


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

            <Route path="/rForm" element={<RestaurantForm />} />
            <Route path="/rList" element={<RestaurantList />} />
            <Route path="/rVerify" element={<RestaurantVerification />} />

            <Route path="/order" element={<Placeorder />} />
            <Route path="/order/confirmation/:orderId" element={<OrderConfirmation />} />
            <Route path="/rMenu" element={<RestaurantMenu />} />
            <Route path="/rMenuList" element={<RestaurantMenuList />} />
            <Route path="/shop" element={<ShopPage />} />


            <Route path="/userorders" element={<UserOrders />} />

            
            <Route path="/order/:orderId" element={<OrderDetailsPage />} />
            
          </Routes>
        </main>
      </Router>
    </>
  );
}

export default App;
