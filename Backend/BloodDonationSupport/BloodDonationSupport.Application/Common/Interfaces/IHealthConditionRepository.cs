using BloodDonationSupport.Application.Features.References.DTOs.Response;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IHealthConditionRepository
    {
        Task<IEnumerable<HealthConditionData>> GetAllAsync();
    }
}