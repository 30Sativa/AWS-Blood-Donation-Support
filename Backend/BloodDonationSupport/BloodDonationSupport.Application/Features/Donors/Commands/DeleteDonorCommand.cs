using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using MediatR;

namespace BloodDonationSupport.Application.Features.Donors.Commands
{
    public record DeleteDonorCommand(long DonorId) : IRequest<BaseResponse<string>>;

    public class DeleteDonorCommandHandler : IRequestHandler<DeleteDonorCommand, BaseResponse<string>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IDonorRepository _donorRepository;

        public DeleteDonorCommandHandler(IUnitOfWork unitOfWork, IDonorRepository donorRepository)
        {
            _unitOfWork = unitOfWork;
            _donorRepository = donorRepository;
        }

        public async Task<BaseResponse<string>> Handle(DeleteDonorCommand request, CancellationToken cancellationToken)
        {
            var donor = await _donorRepository.GetByIdAsync(request.DonorId);
            if (donor == null)
            {
                return BaseResponse<string>.FailureResponse("Donor not found.");
            }

            _donorRepository.Delete(donor);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return BaseResponse<string>.SuccessResponse("Donor deleted successfully.");
        }
    }
}

