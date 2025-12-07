using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Donors.Queries
{
    public class GetAllDonorsQueryHandler
        : IRequestHandler<GetAllDonorsQuery, BaseResponse<List<DonorProfileResponse>>>
    {
        private readonly IDonorRepository _donorRepo;

        public GetAllDonorsQueryHandler(IDonorRepository donorRepo)
        {
            _donorRepo = donorRepo;
        }

        public async Task<BaseResponse<List<DonorProfileResponse>>> Handle(
            GetAllDonorsQuery request,
            CancellationToken cancellationToken)
        {
            var donors = await _donorRepo.GetAllAsync();

            var result = donors.Select(d => new DonorProfileResponse
            {
                DonorId = d.Id,
                UserId = d.UserId,
                FullName = d.Profile?.FullName ?? "",
                PhoneNumber = d.User?.PhoneNumber,
                Email = d.User?.Email?.Value,

                BloodTypeId = d.BloodTypeId,
                BloodGroup = d.BloodType != null
                    ? $"{d.BloodType.Abo}{d.BloodType.Rh}"
                    : null,

                AddressId = d.AddressId,
                AddressDisplay = d.AddressDisplay,

                Latitude = d.LastKnownLocation?.Latitude,
                Longitude = d.LastKnownLocation?.Longitude,

                TravelRadiusKm = d.TravelRadiusKm,
                NextEligibleDate = d.NextEligibleDate,
                IsReady = d.IsReady,

                Availabilities = d.Availabilities
                    .Select(a => new DonorAvailabilityResponse
                    {
                        Weekday = a.Weekday,
                        TimeFromMin = a.TimeFromMin,
                        TimeToMin = a.TimeToMin
                    }).ToList(),

                HealthConditions = d.HealthConditions
                    .Select(h => new DonorHealthConditionItemResponse
                    {
                        ConditionId = h.ConditionId,
                        ConditionName = h.ConditionName
                    }).ToList(),

                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt
            }).ToList();

            return BaseResponse<List<DonorProfileResponse>>.SuccessResponse(
                result,
                "Get all donors successfully"
            );
        }
    }
}
