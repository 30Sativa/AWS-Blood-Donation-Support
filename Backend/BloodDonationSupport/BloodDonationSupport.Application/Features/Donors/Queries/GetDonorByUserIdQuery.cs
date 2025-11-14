using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Donors.Queries
{
    public record GetDonorByUserIdQuery(long UserId) : IRequest<BaseResponse<DonorDetail>>;

    public class GetDonorByUserIdQueryHandler : IRequestHandler<GetDonorByUserIdQuery, BaseResponse<DonorDetail>>
    {
        private readonly IDonorRepository _donorRepository;

        public GetDonorByUserIdQueryHandler(IDonorRepository donorRepository)
        {
            _donorRepository = donorRepository;
        }

        public async Task<BaseResponse<DonorDetail>> Handle(GetDonorByUserIdQuery request, CancellationToken cancellationToken)
        {
            var donor = await _donorRepository.GetByUserIdAsync(request.UserId);
            if (donor == null)
            {
                return BaseResponse<DonorDetail>.FailureResponse("Donor not found for this user.");
            }

            var response = new DonorDetail
            {
                DonorId = donor.Id,
                FullName = donor.User?.Profile?.FullName,
                BloodGroup = donor.BloodType != null ? donor.BloodType.Abo + donor.BloodType.Rh : null,
                IsReady = donor.IsReady,
                NextEligibleDate = donor.NextEligibleDate,
                CreatedAt = donor.CreatedAt,
                Address = donor.AddressDisplay,
                Availabilities = donor.Availabilities.Select(a => 
                    $"{ToVietnameseDay(a.Weekday)}: {MinutesToString(a.TimeFromMin)} - {MinutesToString(a.TimeToMin)}").ToList(),
                HealthConditions = donor.HealthConditions.Select(h => h.ConditionName ?? "Unknown").ToList(),
                LastKnownLocation = donor.LastKnownLocation != null 
                    ? $"{donor.LastKnownLocation.Latitude}, {donor.LastKnownLocation.Longitude}" 
                    : null,
                UpdatedAt = donor.UpdatedAt
            };

            return BaseResponse<DonorDetail>.SuccessResponse(response);
        }

        private static string ToVietnameseDay(byte weekday)
        {
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

