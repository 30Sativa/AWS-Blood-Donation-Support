using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Models;
using BloodDonationSupport.Application.Features.Donors.DTOs.Request;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Donors.Queries
{
    public record SearchDonorsQuery(SearchDonorsRequest Request) : IRequest<PaginatedResponse<DonorResponse>>;

    public class SearchDonorsQueryHandler : IRequestHandler<SearchDonorsQuery, PaginatedResponse<DonorResponse>>
    {
        private readonly IDonorRepository _donorRepository;

        public SearchDonorsQueryHandler(IDonorRepository donorRepository)
        {
            _donorRepository = donorRepository;
        }

        public async Task<PaginatedResponse<DonorResponse>> Handle(SearchDonorsQuery request, CancellationToken cancellationToken)
        {
            var (donors, totalCount) = await _donorRepository.SearchAsync(
                request.Request.Keyword,
                request.Request.BloodTypeId,
                request.Request.IsReady,
                request.Request.PageNumber,
                request.Request.PageSize);

            var result = donors.Select(d => new DonorResponse
            {
                DonorId = d.Id,
                FullName = d.User?.Profile?.FullName,
                BloodGroup = d.BloodType != null
                    ? d.BloodType.Abo + d.BloodType.Rh
                    : null,
                IsReady = d.IsReady,
                NextEligibleDate = d.NextEligibleDate,
                CreatedAt = d.CreatedAt
            }).ToList();

            return new PaginatedResponse<DonorResponse>
            {
                Items = result,
                TotalCount = totalCount,
                PageNumber = request.Request.PageNumber,
                PageSize = request.Request.PageSize
            };
        }
    }
}

