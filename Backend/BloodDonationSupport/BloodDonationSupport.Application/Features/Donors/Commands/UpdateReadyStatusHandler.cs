using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using MediatR;

namespace BloodDonationSupport.Application.Features.Donors.Commands
{
    public class UpdateReadyStatusHandler : IRequestHandler<UpdateReadyStatusCommand, BaseResponse<string>>
    {
        private readonly IDonorRepository _donorRepo;
        private readonly IUnitOfWork _uow;

        public UpdateReadyStatusHandler(IDonorRepository donorRepo, IUnitOfWork uow)
        {
            _donorRepo = donorRepo;
            _uow = uow;
        }

        public async Task<BaseResponse<string>> Handle(
            UpdateReadyStatusCommand command,
            CancellationToken cancellationToken)
        {
            var req = command.Request;

            var donor = await _donorRepo.GetByIdAsync(req.DonorId);
            if (donor == null)
                return BaseResponse<string>.FailureResponse("Donor not found.");

            try
            {
                donor.MarkReady(req.IsReady);
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