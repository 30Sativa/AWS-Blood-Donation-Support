using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Domain.Donors.Rules;
using MediatR;

namespace BloodDonationSupport.Application.Features.Donors.Commands
{
    public class UpdateReadyStatusHandler : IRequestHandler<UpdateReadyStatusCommand, BaseResponse<string>>
    {
        private readonly IDonorRepository _donorRepo;
        private readonly IUnitOfWork _uow;
        private readonly IDateTimeProvider _dateTimeProvider;

        public UpdateReadyStatusHandler(
            IDonorRepository donorRepo,
            IUnitOfWork uow,
            IDateTimeProvider dateTimeProvider)
        {
            _donorRepo = donorRepo;
            _uow = uow;
            _dateTimeProvider = dateTimeProvider;
        }

        public async Task<BaseResponse<string>> Handle(
            UpdateReadyStatusCommand command,
            CancellationToken cancellationToken)
        {
            // 🔥 FIX: Load đầy đủ relations, tránh mất Availabilities + Conditions
            var donor = await _donorRepo.GetByIdWithRelationsAsync(command.DonorId);
            if (donor == null)
                return BaseResponse<string>.FailureResponse("Donor not found.");

            // ======================================================
            // 1) CHECK ELIGIBILITY
            // ======================================================
            var today = _dateTimeProvider.Today();

            var rule = new DonorEligibilityRule(donor.NextEligibleDate, today);
            if (rule.IsBroken())
                return BaseResponse<string>.FailureResponse(rule.Message);

            // ======================================================
            // 2) UPDATE READY STATUS
            // ======================================================
            try
            {
                donor.MarkReady(command.Request.IsReady);
            }
            catch (Exception ex)
            {
                return BaseResponse<string>.FailureResponse(ex.Message);
            }

            _donorRepo.Update(donor);
            await _uow.SaveChangesAsync(cancellationToken);

            return BaseResponse<string>.SuccessResponse("Ready status updated successfully.");
        }
    }
}
