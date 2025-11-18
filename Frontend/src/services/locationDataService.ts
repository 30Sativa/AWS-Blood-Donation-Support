/**
 * Service để lấy danh sách tỉnh/thành phố và quận/huyện của Việt Nam
 * Sử dụng API từ provinces.open-api.vn
 */

export interface Province {
  code: string;
  name: string;
  name_en?: string;
}

export interface District {
  code: string;
  name: string;
  name_en?: string;
  province_code: string;
}

const API_BASE = "https://provinces.open-api.vn/api";

export const locationDataService = {
  /**
   * Lấy danh sách tất cả tỉnh/thành phố
   */
  async getProvinces(): Promise<Province[]> {
    try {
      const response = await fetch(`${API_BASE}/p/`);
      if (!response.ok) {
        throw new Error("Failed to fetch provinces");
      }
      const data = await response.json();
      return data.map((p: any) => ({
        code: p.code,
        name: p.name,
        name_en: p.name_en,
      }));
    } catch (error) {
      console.error("Error fetching provinces:", error);
      // Fallback: return empty array
      return [];
    }
  },

  /**
   * Lấy danh sách quận/huyện theo tỉnh/thành phố
   */
  async getDistrictsByProvince(provinceCode: string): Promise<District[]> {
    try {
      const response = await fetch(`${API_BASE}/p/${provinceCode}?depth=2`);
      if (!response.ok) {
        throw new Error("Failed to fetch districts");
      }
      const data = await response.json();
      return data.districts?.map((d: any) => ({
        code: d.code,
        name: d.name,
        name_en: d.name_en,
        province_code: provinceCode,
      })) || [];
    } catch (error) {
      console.error("Error fetching districts:", error);
      // Fallback: return empty array
      return [];
    }
  },

  /**
   * Lấy thông tin tỉnh/thành phố theo code
   */
  async getProvinceByCode(provinceCode: string): Promise<Province | null> {
    try {
      const response = await fetch(`${API_BASE}/p/${provinceCode}`);
      if (!response.ok) {
        throw new Error("Failed to fetch province");
      }
      const data = await response.json();
      return {
        code: data.code,
        name: data.name,
        name_en: data.name_en,
      };
    } catch (error) {
      console.error("Error fetching province:", error);
      return null;
    }
  },

  /**
   * Lấy thông tin quận/huyện theo code
   */
  async getDistrictByCode(districtCode: string): Promise<District | null> {
    try {
      const response = await fetch(`${API_BASE}/d/${districtCode}?depth=2`);
      if (!response.ok) {
        throw new Error("Failed to fetch district");
      }
      const data = await response.json();
      return {
        code: data.code,
        name: data.name,
        name_en: data.name_en,
        province_code: data.province_code,
      };
    } catch (error) {
      console.error("Error fetching district:", error);
      return null;
    }
  },
};
