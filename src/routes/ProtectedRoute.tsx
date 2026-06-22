import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  if (!user) {
    // redirecionar para a rota de login correta
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};