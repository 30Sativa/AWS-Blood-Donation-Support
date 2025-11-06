import { useState, useEffect } from "react";
import { getMemberProfile } from "@/services/axios";

const getUserIdFromToken = (): number | null => {
  try {
    const savedUserId = localStorage.getItem("userId");
    if (savedUserId) {
      const userId = Number(savedUserId);
      if (!isNaN(userId)) return userId;
    }

    const token = localStorage.getItem("token");
    if (!token) return null;

    const payload = token.split(".")[1];
    if (!payload) return null;

    const decoded = JSON.parse(atob(payload));

    const userId =
      decoded.userId ||
      decoded.user_id ||
      decoded.UserId ||
      decoded.sub ||
      decoded.id ||
      decoded.nameid ||
      decoded.unique_name ||
      null;

    if (userId) {
      const numUserId = Number(userId);
      if (!isNaN(numUserId)) {
        localStorage.setItem("userId", String(numUserId));
        return numUserId;
      }
    }

    return null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error decoding token:", error);
    return null;
  }
};

export function useUserProfile() {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const userId = getUserIdFromToken();
        if (!userId) {
          setError("User not found");
          setLoading(false);
          return;
        }

        const res = await getMemberProfile(userId);
        if (res && res.success && res.data) {
          setProfile(res.data);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error loading profile";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { profile, loading, error };
}
