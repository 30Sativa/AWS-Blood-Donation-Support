using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using BloodDonationSupport.Application.Features.Requests.DTOs.Response;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface ILocationService
    {
        Task<IEnumerable<NearbyDonorResponse>> GetNearbyDonorsAsync(
            double latitude, double longitude, double radiusKm);
        Task<IEnumerable<NearbyRequestResponse>> GetNearbyRequestsAsync(double latitude, double longitude, double radiusKm); 
    }
}