import { useContext } from "react";
import { AuthContext, type AuthContextType } from "../providers/AuthProvider";

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>. Wrap your component tree with AppProviders.");
  }
  return context;
};
