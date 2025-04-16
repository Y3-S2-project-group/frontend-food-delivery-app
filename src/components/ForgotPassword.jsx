import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const ForgotPassword = () => {
    const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // For success or error messages

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
        const response = await fetch('http://localhost:8000/api/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            setMessage({ type: 'success', text: data.msg || 'OTP sent to your email.' });
            localStorage.setItem('email', email);
            navigate('/verify-otp', { state: { email } }); // Navigate to OTP verification page
        } else {
            setMessage({ type: 'error', text: data.msg || 'An error occurred.' });
        }
    } catch (error) {
        setMessage({ type: 'error', text: 'Server error. Please try again later.' });
    } finally {
        setLoading(false);
    }
};

  return (
    <div>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address to receive a password reset OTP.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" variant="primary" disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
              {message && (
                <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {message.text}
                </p>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Remembered your password? <a href="/" className="underline ml-1">Login</a>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPassword;