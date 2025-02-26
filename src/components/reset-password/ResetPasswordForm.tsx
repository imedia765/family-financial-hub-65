
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ResetPasswordFormProps {
  token: string;
}

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate password length
    if (newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 8 characters long",
      });
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data: tokenData, error: tokenError } = await supabase.rpc(
        "validate_reset_token",
        { token_value: token }
      );

      if (tokenError || !tokenData) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invalid or expired reset token",
        });
        return;
      }

      const { error: resetError } = await supabase.rpc(
        "handle_password_reset_with_token",
        {
          token_value: token,
          new_password: newPassword,
        }
      );

      if (resetError) throw resetError;

      toast({
        title: "Success",
        description: "Password has been reset successfully",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to reset password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleResetPassword} className="space-y-4">
      <div>
        <label htmlFor="newPassword" className="block text-sm mb-2">
          New Password
        </label>
        <Input
          id="newPassword"
          type="password"
          placeholder="Enter new password (minimum 8 characters)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="bg-black/40"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm mb-2">
          Confirm Password
        </label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="bg-black/40"
          disabled={isLoading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );
};
