// /app/_layout.tsx
import { Stack } from "expo-router";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import useAuth from "../src/hooks/useAuth";

export default function Layout() {
  const { userToken, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!userToken) {
      router.replace("/login");
    } else {
      router.replace("/");
    }
  }, [userToken, loading]);

  return <Stack />;
}