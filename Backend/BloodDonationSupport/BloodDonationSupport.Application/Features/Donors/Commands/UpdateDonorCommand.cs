using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Donors.DTOs.Request;
using BloodDonationSupport.Domain.Shared.ValueObjects;
using MediatR;

namespace BloodDonationSupport.Application.Features.Donors.Commands
{
    public record UpdateDonorCommand(long DonorId, UpdateDonorRequest Request) : IRequest<BaseResponse<string>>;

    public class UpdateDonorCommandHandler : IRequestHandler<UpdateDonorCommand, BaseResponse<string>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IDonorRepository _donorRepository;

        public UpdateDonorCommandHandler(IUnitOfWork unitOfWork, IDonorRepository donorRepository)
        {
            _unitOfWork = unitOfWork;
            _donorRepository = donorRepository;
        }

        public async Task<BaseResponse<string>> Handle(UpdateDonorCommand request, CancellationToken cancellationToken)
        {
            var donor = await _donorRepository.GetByIdAsync(request.DonorId);
            if (donor == null)
            {
                return BaseResponse<string>.FailureResponse("Donor not found.");
            }

            if (request.Request.BloodTypeId.HasValue)
            {
                donor.SetBloodType(request.Request.BloodTypeId.Value);
            }

            if (request.Request.AddressId.HasValue)
            {
                donor.SetAddress(request.Request.AddressId.Value);
            }

            if (request.Request.TravelRadiusKm.HasValue)
            {
                donor.UpdateTravelRadius(request.Request.TravelRadiusKm.Value);
            }

            if (request.Request.Latitude.HasValue && request.Request.Longitude.HasValue)
            {
                var location = GeoLocation.Create(request.Request.Latitude.Value, request.Request.Longitude.Value);
                donor.UpdateLocation(location);
            }

            _donorRepository.Update(donor);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return BaseResponse<string>.SuccessResponse("Donor updated successfully.");
        }
    }
}

