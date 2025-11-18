import { useState, useEffect } from "react";
import { profileService } from "@/services/profileService";
import type { UserProfile } from "@/types/profile";

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // Sử dụng endpoint /api/Users/me để lấy thông tin user hiện tại
        console.log("[DEBUG] useUserProfile: Loading profile using getCurrentUser()");
        const res = await profileService.getCurrentUser();
        console.log("[DEBUG] useUserProfile: Received profile response", res);
        if (res && res.success && res.data) {
          setProfile(res.data);
          // Lưu userId vào localStorage để sử dụng sau này
          if (res.data.userId) {
            localStorage.setItem("userId", String(res.data.userId));
          }
        } else {
          // Nếu response không có data hoặc success = false
          setError("Không thể tải thông tin profile. Vui lòng thử lại.");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error loading profile";
        setError(msg);
        console.error("Error in useUserProfile:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { profile, loading, error };
}
