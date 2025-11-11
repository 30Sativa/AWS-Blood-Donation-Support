using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface ILocationService
    {
        Task<List<NearbyDonorResponse>> GetNearbyDonorsAsync(
            double latitude, double longitude, double radiusKm);
    }
}
