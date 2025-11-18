using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.References.DTOs.Response;
using MediatR;
using Microsoft.Extensions.Logging;

namespace BloodDonationSupport.Application.Features.References.Queries
{
    public record GetAllHealthConditionsQuery : IRequest<BaseResponse<IEnumerable<HealthConditionResponse>>>;

    public class GetAllHealthConditionsQueryHandler : IRequestHandler<GetAllHealthConditionsQuery, BaseResponse<IEnumerable<HealthConditionResponse>>>
    {
        private readonly IHealthConditionRepository _healthConditionRepository;
        private readonly ILogger<GetAllHealthConditionsQueryHandler> _logger;

        public GetAllHealthConditionsQueryHandler(
            IHealthConditionRepository healthConditionRepository,
            ILogger<GetAllHealthConditionsQueryHandler> logger)
        {
            _healthConditionRepository = healthConditionRepository;
            _logger = logger;
        }

        public async Task<BaseResponse<IEnumerable<HealthConditionResponse>>> Handle(GetAllHealthConditionsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var items = await _healthConditionRepository.GetAllAsync();
                var responses = items.Select(hc => new HealthConditionResponse
                {
                    Id = hc.Id,
                    Code = hc.Code,
                    Name = hc.Name,
                    IsDonationEligible = hc.IsDonationEligible
                }).ToList();

                return BaseResponse<IEnumerable<HealthConditionResponse>>.SuccessResponse(responses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get health conditions");
                return BaseResponse<IEnumerable<HealthConditionResponse>>.FailureResponse("Failed to get health conditions.");
            }
        }
    }
}

