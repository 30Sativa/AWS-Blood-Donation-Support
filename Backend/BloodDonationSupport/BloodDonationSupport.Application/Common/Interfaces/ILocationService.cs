using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using BloodDonationSupport.Application.Features.Requests.DTOs.Response;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface ILocationService
    {
        Task<List<NearbyDonorResponse>> GetNearbyDonorsAsync(
            double latitude, double longitude, double radiusKm);
        Task<List<NearbyRequestResponse>> GetNearbyRequestsAsync(double latitude, double longitude, double radiusKm); 
    }
}