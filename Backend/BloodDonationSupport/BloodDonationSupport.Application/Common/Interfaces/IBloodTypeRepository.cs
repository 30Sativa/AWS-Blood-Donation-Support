using BloodDonationSupport.Application.Features.References.DTOs.Response;

namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface IBloodTypeRepository
    {
        Task<IEnumerable<BloodTypeData>> GetAllAsync();
    }
}