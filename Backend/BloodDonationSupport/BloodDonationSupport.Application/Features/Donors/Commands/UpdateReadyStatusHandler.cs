using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using MediatR;

namespace BloodDonationSupport.Application.Features.Donors.Commands
{
    public class UpdateReadyStatusHandler : IRequestHandler<UpdateReadyStatusCommand, BaseResponse<string>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IDonorRepository _donorRepository;

        public UpdateReadyStatusHandler(IUnitOfWork unitOfWork, IDonorRepository donorRepository)
        {
            _unitOfWork = unitOfWork;
            _donorRepository = donorRepository;
        }

        public async Task<BaseResponse<string>> Handle(UpdateReadyStatusCommand request, CancellationToken cancellationToken)
        {
            var donor = await _donorRepository.GetByIdAsync(request.Request.DonorId);
            if (donor == null)
                return BaseResponse<string>.FailureResponse("Donor not found.");
            donor.MarkReady(request.Request.IsReady);
            _donorRepository.Update(donor);
            await _unitOfWork.SaveChangesAsync();
            var msg = request.Request.IsReady
                ? "Donor is now marked as ready to donate."
                : "Donor is no longer marked as ready.";
            return BaseResponse<string>.SuccessResponse(msg);
        }
    }
}