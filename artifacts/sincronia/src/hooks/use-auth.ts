import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetMe } from "@workspace/api-client-react";

// Helper to set token and trigger a global event for the app to sync
export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem("sincronia_token", token);
  } else {
    localStorage.removeItem("sincronia_token");
  }
  window.dispatchEvent(new Event("sincronia-auth-change"));
};

export function useAuth() {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading, isError, refetch } = useGetMe({
    query: {
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 mins
    },
  });

  useEffect(() => {
    const handleAuthChange = () => refetch();
    window.addEventListener("sincronia-auth-change", handleAuthChange);
    return () => window.removeEventListener("sincronia-auth-change", handleAuthChange);
  }, [refetch]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !isError,
    logout: () => {
      setAuthToken(null);
      setLocation("/login");
    }
  };
}
