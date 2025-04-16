import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import axios from 'axios';

const VerifyOTP = () => {

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/auth/verify-otp', { email, otp });
      setMessage(response.data.msg);
      // Navigate to reset password page upon successful verification
      navigate('/reset-password', { state: { email } });
    } catch (error) {
      setMessage(error.response?.data?.msg || 'An error occurred');
    }
  };

  return (
    <div>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Verify OTP</CardTitle>
          <CardDescription>
            Enter the OTP sent to your email address to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyOTP}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="otp">OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              {message && <p className="text-sm text-red-500">{message}</p>}
              <Button type="submit" className="w-full" variant="primary">
                Verify OTP
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Didn't receive the code? <a href="/forgot-password" className="underline ml-1">Resend</a>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyOTP;
