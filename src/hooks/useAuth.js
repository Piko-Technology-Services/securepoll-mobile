// /src/hooks/useAuth.js
import { useEffect, useState } from "react";
import { getToken, removeToken } from "../lib/storage";

export default function useAuth() {
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadToken = async () => {
    const token = await getToken();
    setUserToken(token);
    setLoading(false);
  };

  const logout = async () => {
    await removeToken();
    setUserToken(null);
  };

  useEffect(() => {
    loadToken();
  }, []);

  return {
    userToken,
    loading,
    setUserToken,
    logout,
  };
}