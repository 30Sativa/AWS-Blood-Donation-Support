// src/components/ui/ProfileCompletionGuard.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { profileService } from "@/services/profileService";
import type { UserProfile } from "@/types/profile";

interface ProfileCompletionGuardProps {
  children: React.ReactNode;
}

/**
 * Component này kiểm tra xem user đã điền đầy đủ thông tin chưa
 * (Không redirect nữa, chỉ để kiểm tra)
 */
export function ProfileCompletionGuard({ children }: ProfileCompletionGuardProps) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Các trang được phép truy cập mà không cần profile đầy đủ
  const allowedPaths = [
    "/member/account-settings",
    "/login",
    "/register",
  ];

  useEffect(() => {
    checkProfileCompletion();
  }, [location.pathname]);

  const checkProfileCompletion = async () => {
    // Nếu đang ở trang được phép, không cần check
    if (allowedPaths.some((path) => location.pathname.startsWith(path))) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await profileService.getCurrentUser();

      if (!response.success || !response.data) {
        // Không lấy được profile, redirect về login
        navigate("/login");
        return;
      }

      const userProfile = response.data;

      // Kiểm tra các thông tin bắt buộc
      const isProfileComplete = checkRequiredFields(userProfile);

      // Không redirect nữa, chỉ log để debug nếu cần
      if (!isProfileComplete) {
        console.log("Profile chưa đầy đủ, nhưng không redirect nữa");
      }
    } catch (error) {
      console.error("Check profile completion error:", error);
      // Có lỗi, redirect về login
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const checkRequiredFields = (profile: UserProfile): boolean => {
    // Kiểm tra các trường bắt buộc
    const requiredFields = {
      fullName: profile.fullName,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
      gender: profile.gender,
      birthYear: profile.birthYear,
      addressId: profile.addressId,
      bloodType: profile.bloodType,
    };

    // Kiểm tra xem tất cả các trường có giá trị không
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.log("Missing required fields:", missingFields);
      return false;
    }

    return true;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        <p className="mt-4 text-gray-600 text-sm">Đang kiểm tra thông tin...</p>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Hook để kiểm tra profile completion status
 */
export function useProfileCompletion() {
  const [isComplete, setIsComplete] = useState<boolean | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkCompletion();
  }, []);

  const checkCompletion = async () => {
    try {
      setLoading(true);
      const response = await profileService.getCurrentUser();

      if (!response.success || !response.data) {
        setIsComplete(false);
        return;
      }

      const profile = response.data;
      const requiredFields = {
        fullName: profile.fullName,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        gender: profile.gender,
        birthYear: profile.birthYear,
        addressId: profile.addressId,
        bloodType: profile.bloodType,
      };

      const missing = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

      setMissingFields(missing);
      setIsComplete(missing.length === 0);
    } catch (error) {
      console.error("Check completion error:", error);
      setIsComplete(false);
    } finally {
      setLoading(false);
    }
  };

  return { isComplete, missingFields, loading, refetch: checkCompletion };
}
