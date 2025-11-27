using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Models;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Donors.Queries
{
    public class SearchDonorsQueryHandler : IRequestHandler<SearchDonorsQuery, PaginatedResponse<DonorResponse>>
    {
        private readonly IDonorRepository _donorRepo;

        public SearchDonorsQueryHandler(IDonorRepository donorRepo)
        {
            _donorRepo = donorRepo;
        }

        public async Task<PaginatedResponse<DonorResponse>> Handle(SearchDonorsQuery request, CancellationToken cancellationToken)
        {
            var req = request.Request;

            var (items, totalCount) = await _donorRepo.SearchAsync(
                req.Keyword,
                req.BloodTypeId,
                req.IsReady,
                req.PageNumber,
                req.PageSize
            );

            var list = items.Select(d => new DonorResponse
            {
                DonorId = d.Id,
                FullName = d.User?.Profile?.FullName ?? "",
                Email = d.User?.Email?.Value ?? "",
                PhoneNumber = d.User?.PhoneNumber,
                BloodGroup = d.BloodType != null
                    ? $"{d.BloodType.Abo} {d.BloodType.Rh}"
                    : null,
                IsReady = d.IsReady,
                AddressDisplay = d.AddressDisplay,
                CreatedAt = d.CreatedAt
            });

            var result = new PaginatedResponse<DonorResponse>
            {
                Items = list,
                TotalCount = totalCount,
                PageNumber = req.PageNumber,
                PageSize = req.PageSize
            };
            return result;
        }
    }
}