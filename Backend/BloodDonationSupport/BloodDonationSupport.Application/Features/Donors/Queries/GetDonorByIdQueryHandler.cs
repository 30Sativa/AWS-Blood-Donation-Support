using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Donors.Queries
{
    public class GetDonorByIdQueryHandler : IRequestHandler<GetDonorByIdQuery, BaseResponse<DonorDetail>>
    {
        private readonly IDonorRepository _donorRepository;

        public GetDonorByIdQueryHandler(IDonorRepository donorRepository)
        {
            _donorRepository = donorRepository;
        }

        public async Task<BaseResponse<DonorDetail>> Handle(GetDonorByIdQuery request, CancellationToken cancellationToken)
        {
            var donor = await _donorRepository.GetByIdWithRelationsAsync(request.DonorId);
            if (donor == null)
            {
                return BaseResponse<DonorDetail>.FailureResponse("Donor not found");
            }
            var dto = new DonorDetail
            {
                DonorId = donor.Id,
                FullName = donor.User?.Profile?.FullName,
                BloodGroup = donor.BloodType != null
                    ? $"{donor.BloodType.Abo}{donor.BloodType.Rh}"
                    : null,
                IsReady = donor.IsReady,
                NextEligibleDate = donor.NextEligibleDate,
                CreatedAt = donor.CreatedAt,
                UpdatedAt = donor.UpdatedAt,
                Address = donor.AddressDisplay,
                Availabilities = donor.Availabilities?
                    .Select(a => $"{ToVietnameseDay(a.Weekday)}: {MinutesToString(a.TimeFromMin)} - {MinutesToString(a.TimeToMin)}")
                    .ToList(),
                HealthConditions = donor.HealthConditions?
                    .Select(h => h.ConditionName ?? $"Condition #{h.ConditionId}")
                    .ToList(),
                LastKnownLocation = donor.LastKnownLocation?.ToString()
            };
            return BaseResponse<DonorDetail>.SuccessResponse(dto, "Donor details retrieved successfully.");
        }

        private static string ToVietnameseDay(byte weekday)
        {
            // 0=CN, 1=Thứ 2, ..., 6=Thứ 7
            return weekday switch
            {
                0 => "Chủ nhật",
                1 => "Thứ 2",
                2 => "Thứ 3",
                3 => "Thứ 4",
                4 => "Thứ 5",
                5 => "Thứ 6",
                6 => "Thứ 7",
                _ => $"Thứ {weekday}"
            };
        }

        private static string MinutesToString(short minutes)
        {
            var h = minutes / 60;
            var m = minutes % 60;
            return $"{h:00}:{m:00}";
        }
    }
}