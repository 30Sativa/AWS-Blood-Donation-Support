using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Domain.Donors.Entities;
using MediatR;

namespace BloodDonationSupport.Application.Features.Donors.Commands
{
    public class UpdateHealthConditionsHandler : IRequestHandler<UpdateHealthConditionsCommand, BaseResponse<string>>
    {
        private readonly IDonorRepository _donorRepo;
        private readonly IUnitOfWork _uow;

        public UpdateHealthConditionsHandler(IDonorRepository donorRepo, IUnitOfWork uow)
        {
            _donorRepo = donorRepo;
            _uow = uow;
        }

        public async Task<BaseResponse<string>> Handle(
            UpdateHealthConditionsCommand command,
            CancellationToken cancellationToken)
        {
            var req = command.Request;

            var donor = await _donorRepo.GetByIdWithRelationsAsync(req.DonorId);
            if (donor == null)
                return BaseResponse<string>.FailureResponse("Donor not found.");

            // Clear old conditions
            donor.ClearHealthConditions();

            // Add new ones
            if (req.HealthConditionIds != null)
            {
                foreach (var id in req.HealthConditionIds)
                {
                    donor.AddHealthCondition(
                        DonorHealthConditionDomain.Create(donor.Id, id)
                    );
                }
            }

            _donorRepo.Update(donor);
            await _uow.SaveChangesAsync(cancellationToken);

            return BaseResponse<string>.SuccessResponse(
                "Health conditions updated successfully.");
        }
    }
}