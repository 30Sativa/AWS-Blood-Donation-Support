using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.References.DTOs.Response;
using MediatR;
using Microsoft.Extensions.Logging;

namespace BloodDonationSupport.Application.Features.References.Queries
{
    public record GetAllBloodTypesQuery : IRequest<BaseResponse<IEnumerable<BloodTypeResponse>>>;

    public class GetAllBloodTypesQueryHandler : IRequestHandler<GetAllBloodTypesQuery, BaseResponse<IEnumerable<BloodTypeResponse>>>
    {
        private readonly IBloodTypeRepository _bloodTypeRepository;
        private readonly ILogger<GetAllBloodTypesQueryHandler> _logger;

        public GetAllBloodTypesQueryHandler(IBloodTypeRepository bloodTypeRepository, ILogger<GetAllBloodTypesQueryHandler> logger)
        {
            _bloodTypeRepository = bloodTypeRepository;
            _logger = logger;
        }

        public async Task<BaseResponse<IEnumerable<BloodTypeResponse>>> Handle(GetAllBloodTypesQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var items = await _bloodTypeRepository.GetAllAsync();

                var responses = items.Select(bt => new BloodTypeResponse
                {
                    Id = bt.Id,
                    Name = $"{bt.Abo}{bt.Rh}",
                    Code = $"{bt.Abo}{bt.Rh}",
                    Description = $"{bt.Abo}{bt.Rh} blood type"
                }).ToList();

                return BaseResponse<IEnumerable<BloodTypeResponse>>.SuccessResponse(responses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get blood types");
                return BaseResponse<IEnumerable<BloodTypeResponse>>.FailureResponse("Failed to get blood types.");
            }
        }
    }
}

