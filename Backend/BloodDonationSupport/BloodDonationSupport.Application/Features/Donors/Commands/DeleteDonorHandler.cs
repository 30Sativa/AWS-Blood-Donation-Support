using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using MediatR;

namespace BloodDonationSupport.Application.Features.Donors.Commands
{
    public class DeleteDonorHandler
    : IRequestHandler<DeleteDonorCommand, BaseResponse<string>>
    {
        private readonly IDonorRepository _donorRepo;
        private readonly IUnitOfWork _uow;

        public DeleteDonorHandler(IDonorRepository donorRepo, IUnitOfWork uow)
        {
            _donorRepo = donorRepo;
            _uow = uow;
        }

        public async Task<BaseResponse<string>> Handle(
            DeleteDonorCommand command,
            CancellationToken cancellationToken)
        {
            var donor = await _donorRepo.GetByIdWithRelationsAsync(command.DonorId);
            if (donor == null)
                return BaseResponse<string>.FailureResponse("Donor not found.");

            // Remove donor only (EF cascade will remove availability + health conditions)
            _donorRepo.Delete(donor);

            await _uow.SaveChangesAsync(cancellationToken);

            return BaseResponse<string>.SuccessResponse(
                "Donor deleted successfully.");
        }
    }
}