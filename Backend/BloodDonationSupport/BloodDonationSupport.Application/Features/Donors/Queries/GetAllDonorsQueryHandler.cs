using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Models;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Donors.Queries
{
    public class GetAllDonorsQueryHandler
        : IRequestHandler<GetAllDonorsQuery, PaginatedResponse<DonorResponse>>
    {
        private readonly IDonorRepository _donorRepository;

        public GetAllDonorsQueryHandler(IDonorRepository donorRepository)
        {
            _donorRepository = donorRepository;
        }

        public async Task<PaginatedResponse<DonorResponse>> Handle(
            GetAllDonorsQuery request,
            CancellationToken cancellationToken)
        {
            // Gọi repository, repository sẽ tự Include User và BloodType
            var (donors, totalCount) = await _donorRepository
                .GetPagedWithRelationsAsync(request.PageNumber, request.PageSize);

            // Mapping entity -> DTO (Application layer không xử lý database)
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
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };
        }
    }
}