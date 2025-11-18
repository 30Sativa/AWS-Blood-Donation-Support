using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Donors.DTOs.Request;
using BloodDonationSupport.Domain.Shared.ValueObjects;
using MediatR;

namespace BloodDonationSupport.Application.Features.Donors.Commands
{
    public record UpdateMyDonorCommand(UpdateDonorRequest Request) : IRequest<BaseResponse<string>>;

    public class UpdateMyDonorCommandHandler : IRequestHandler<UpdateMyDonorCommand, BaseResponse<string>>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IDonorRepository _donorRepository;

        public UpdateMyDonorCommandHandler(
            ICurrentUserService currentUserService,
            IUserRepository userRepository,
            IUnitOfWork unitOfWork,
            IDonorRepository donorRepository)
        {
            _currentUserService = currentUserService;
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
            _donorRepository = donorRepository;
        }

        public async Task<BaseResponse<string>> Handle(UpdateMyDonorCommand request, CancellationToken cancellationToken)
        {
            if (!_currentUserService.IsAuthenticated || string.IsNullOrWhiteSpace(_currentUserService.CognitoUserId))
            {
                return BaseResponse<string>.FailureResponse("User is not authenticated.");
            }

            var user = await _userRepository.GetByCognitoUserIdAsync(_currentUserService.CognitoUserId);
            if (user == null)
            {
                return BaseResponse<string>.FailureResponse("User not found.");
            }

            var donor = await _donorRepository.GetByUserIdAsync(user.Id);
            if (donor == null)
            {
                return BaseResponse<string>.FailureResponse("Donor not found for this user.");
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

