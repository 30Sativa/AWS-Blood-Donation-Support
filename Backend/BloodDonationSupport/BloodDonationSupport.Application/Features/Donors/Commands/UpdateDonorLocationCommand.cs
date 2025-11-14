using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Donors.DTOs.Request;
using BloodDonationSupport.Domain.Shared.ValueObjects;
using MediatR;

namespace BloodDonationSupport.Application.Features.Donors.Commands
{
    public record UpdateDonorLocationCommand(long DonorId, UpdateDonorLocationRequest Request) : IRequest<BaseResponse<string>>;

    public class UpdateDonorLocationCommandHandler : IRequestHandler<UpdateDonorLocationCommand, BaseResponse<string>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IDonorRepository _donorRepository;

        public UpdateDonorLocationCommandHandler(IUnitOfWork unitOfWork, IDonorRepository donorRepository)
        {
            _unitOfWork = unitOfWork;
            _donorRepository = donorRepository;
        }

        public async Task<BaseResponse<string>> Handle(UpdateDonorLocationCommand request, CancellationToken cancellationToken)
        {
            var donor = await _donorRepository.GetByIdAsync(request.DonorId);
            if (donor == null)
            {
                return BaseResponse<string>.FailureResponse("Donor not found.");
            }

            var location = GeoLocation.Create(request.Request.Latitude, request.Request.Longitude);
            donor.UpdateLocation(location);

            _donorRepository.Update(donor);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return BaseResponse<string>.SuccessResponse("Donor location updated successfully.");
        }
    }
}

