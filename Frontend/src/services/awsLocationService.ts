/**
 * AWS Location Service Integration
 * Sử dụng AWS Location Service để geocode và autocomplete địa chỉ
 * 
 * Note: Các endpoint này cần được implement ở backend để tránh expose AWS credentials
 * Backend endpoints cần:
 * - GET /api/location/search?query=...&countryCode=...
 * - GET /api/location/place/{placeId}
 * - GET /api/location/geocode?address=...
 * - GET /api/location/reverse-geocode?latitude=...&longitude=...
 */

const LOCATION_API_BASE = import.meta.env.VITE_LOCATION_API_BASE_URL || "";

export interface AWSLocationPlace {
  PlaceId: string;
  Label: string;
  Geometry: {
    Point: [number, number]; // [longitude, latitude]
  };
  AddressNumber?: string;
  Street?: string;
  Municipality?: string;
  Region?: string;
  Country?: string;
  PostalCode?: string;
}

export interface AWSLocationSearchResult {
  Results: AWSLocationPlace[];
  Summary: {
    Text: string;
    MaxResults: number;
  };
}

/**
 * Search places using AWS Location Service
 * Note: This should be called through your backend API for security
 * Frontend should not have AWS credentials
 */
export const awsLocationService = {
  /**
   * Search for places/addresses
   * This should be proxied through your backend API
   */
  async searchPlaces(
    query: string,
    countryCode: string = "VNM"
  ): Promise<AWSLocationPlace[]> {
    try {
      // Gọi qua backend API để tránh expose AWS credentials
      const apiUrl = LOCATION_API_BASE || "/api";
      const response = await fetch(
        `${apiUrl}/location/search?query=${encodeURIComponent(query)}&countryCode=${countryCode}`
      );
      
      if (!response.ok) {
        // Nếu endpoint chưa có, return empty array (fallback)
        if (response.status === 404) {
          console.warn("Location search endpoint not available. Please implement backend endpoint.");
          return [];
        }
        // Check if response is HTML (error page)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
          console.warn("Location search endpoint returned HTML (not implemented).");
          return [];
        }
        throw new Error("Failed to search places");
      }

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn("Location search endpoint returned non-JSON response.");
        return [];
      }

      const text = await response.text();
      // Check if response starts with HTML (error page)
      if (text.trim().startsWith("<!") || text.trim().startsWith("<html")) {
        console.warn("Location search endpoint returned HTML (not implemented).");
        return [];
      }

      const data: AWSLocationSearchResult = JSON.parse(text);
      return data.Results || [];
    } catch (error) {
      // Silently fail - endpoint not implemented yet
      if (error instanceof SyntaxError) {
        console.warn("AWS Location search endpoint not implemented or returned invalid response.");
      } else {
        console.error("AWS Location search error:", error);
      }
      // Fallback: return empty array
      return [];
    }
  },

  /**
   * Get place details by PlaceId
   */
  async getPlaceDetails(placeId: string): Promise<AWSLocationPlace | null> {
    try {
      const apiUrl = LOCATION_API_BASE || "/api";
      const response = await fetch(
        `${apiUrl}/location/place/${encodeURIComponent(placeId)}`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn("Location place details endpoint not available.");
          return null;
        }
        throw new Error("Failed to get place details");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("AWS Location get place details error:", error);
      return null;
    }
  },

  /**
   * Geocode an address (convert address to coordinates)
   */
  async geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const apiUrl = LOCATION_API_BASE || "/api";
      const response = await fetch(
        `${apiUrl}/location/geocode?address=${encodeURIComponent(address)}`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn("Location geocode endpoint not available.");
          return null;
        }
        throw new Error("Failed to geocode address");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("AWS Location geocode error:", error);
      return null;
    }
  },

  /**
   * Reverse geocode (convert coordinates to address)
   */
  async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<AWSLocationPlace | null> {
    try {
      const apiUrl = LOCATION_API_BASE || "/api";
      const response = await fetch(
        `${apiUrl}/location/reverse-geocode?latitude=${latitude}&longitude=${longitude}`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn("Location reverse geocode endpoint not available.");
          return null;
        }
        // Check if response is HTML (error page)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
          console.warn("Location reverse geocode endpoint returned HTML (not implemented).");
          return null;
        }
        throw new Error("Failed to reverse geocode");
      }

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn("Location reverse geocode endpoint returned non-JSON response.");
        return null;
      }

      const text = await response.text();
      // Check if response starts with HTML (error page)
      if (text.trim().startsWith("<!") || text.trim().startsWith("<html")) {
        console.warn("Location reverse geocode endpoint returned HTML (not implemented).");
        return null;
      }

      const data = JSON.parse(text);
      return data;
    } catch (error) {
      // Silently fail - endpoint not implemented yet
      if (error instanceof SyntaxError) {
        console.warn("AWS Location reverse geocode endpoint not implemented or returned invalid response.");
      } else {
        console.error("AWS Location reverse geocode error:", error);
      }
      return null;
    }
  },
};

