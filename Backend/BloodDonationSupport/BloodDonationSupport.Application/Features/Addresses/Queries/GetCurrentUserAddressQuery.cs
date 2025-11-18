using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Addresses.DTOs.Response;
using MediatR;

namespace BloodDonationSupport.Application.Features.Addresses.Queries
{
    public record GetCurrentUserAddressQuery : IRequest<BaseResponse<AddressResponse>>;

    public class GetCurrentUserAddressQueryHandler : IRequestHandler<GetCurrentUserAddressQuery, BaseResponse<AddressResponse>>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IUserRepository _userRepository;
        private readonly IDonorRepository _donorRepository;
        private readonly IAddressRepository _addressRepository;

        public GetCurrentUserAddressQueryHandler(
            ICurrentUserService currentUserService,
            IUserRepository userRepository,
            IDonorRepository donorRepository,
            IAddressRepository addressRepository)
        {
            _currentUserService = currentUserService;
            _userRepository = userRepository;
            _donorRepository = donorRepository;
            _addressRepository = addressRepository;
        }

        public async Task<BaseResponse<AddressResponse>> Handle(GetCurrentUserAddressQuery request, CancellationToken cancellationToken)
        {
            if (!_currentUserService.IsAuthenticated || string.IsNullOrWhiteSpace(_currentUserService.CognitoUserId))
            {
                return BaseResponse<AddressResponse>.FailureResponse("User is not authenticated.");
            }

            var user = await _userRepository.GetByCognitoUserIdAsync(_currentUserService.CognitoUserId);
            if (user == null)
            {
                return BaseResponse<AddressResponse>.FailureResponse("User not found.");
            }

            var donor = await _donorRepository.GetByUserIdAsync(user.Id);
            if (donor == null || !donor.AddressId.HasValue)
            {
                return BaseResponse<AddressResponse>.FailureResponse("User does not have an address. Please register as a donor first.");
            }

            var address = await _addressRepository.GetByIdAsync(donor.AddressId.Value);
            if (address == null)
            {
                return BaseResponse<AddressResponse>.FailureResponse("Address not found.");
            }

            var response = new AddressResponse
            {
                AddressId = address.AddressId!.Value,
                Line1 = address.Line1,
                District = address.District,
                City = address.City,
                Province = address.Province,
                Country = address.Country,
                PostalCode = address.PostalCode,
                NormalizedAddress = address.NormalizedAddress,
                PlaceId = address.PlaceId,
                ConfidenceScore = address.ConfidenceScore,
                Latitude = address.Latitude,
                Longitude = address.Longitude
            };

            return BaseResponse<AddressResponse>.SuccessResponse(response);
        }
    }
}

