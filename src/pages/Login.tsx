import { useEffect } from "react";
import { LoginForm } from "@/components/LoginForm";

const Login = () => {
  useEffect(() => {
    document.title = "Login - MMMES College Library";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Login to MMMES College Library to access books, journals, and your account.");
    }
  }, []);
  return <LoginForm />;
};

export default Login;