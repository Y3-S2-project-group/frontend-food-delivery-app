import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { forgotPassword } from "@/services/api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // For success or error messages

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const data = await forgotPassword(email);
      setMessage({
        type: "success",
        text: data.msg || "OTP sent to your email.",
      });
      localStorage.setItem("email", email);
      navigate("/verify-otp", { state: { email } });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "An error occurred.",
      });
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
              <Button
                type="submit"
                className="w-full"
                variant="primary"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send OTP"}
              </Button>
              {message && (
                <p
                  className={`text-sm ${
                    message.type === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {message.text}
                </p>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Remembered your password?{" "}
          <a href="/" className="underline ml-1">
            Login
          </a>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPassword;
