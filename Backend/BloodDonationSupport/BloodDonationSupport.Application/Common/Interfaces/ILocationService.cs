using BloodDonationSupport.Application.Features.Donors.DTOs.Response;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface ILocationService
    {
        Task<List<NearbyDonorResponse>> GetNearbyDonorsAsync(
            double latitude, double longitude, double radiusKm);
    }
}