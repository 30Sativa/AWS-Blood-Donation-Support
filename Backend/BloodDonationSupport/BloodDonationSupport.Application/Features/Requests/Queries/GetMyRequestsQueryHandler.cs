using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Requests.DTOs.Response;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Requests.Queries
{
    public class GetMyRequestsQueryHandler : IRequestHandler<GetMyRequestsQuery, BaseResponse<IEnumerable<RequestResponse>>>
    {
        private readonly ICurrentUserService _currentUser;
        private readonly IUserRepository _userRepo;
        private readonly IRequestRepository _requestRepo;
        private readonly IAddressRepository _addressRepository;

        public GetMyRequestsQueryHandler(
            ICurrentUserService currentUser,
            IUserRepository userRepo,
            IRequestRepository requestRepo,
            IAddressRepository addressRepository)
        {
            _currentUser = currentUser;
            _userRepo = userRepo;
            _requestRepo = requestRepo;
            _addressRepository = addressRepository;
        }

        public async Task<BaseResponse<IEnumerable<RequestResponse>>> Handle(
            GetMyRequestsQuery request, CancellationToken cancellationToken)
        {
            // 1) User must login
            if (!_currentUser.IsAuthenticated || string.IsNullOrEmpty(_currentUser.CognitoUserId))
                return BaseResponse<IEnumerable<RequestResponse>>
                    .FailureResponse("User not authenticated.");

            // 2) Get user by CognitoId
            var user = await _userRepo.GetByCognitoUserIdAsync(_currentUser.CognitoUserId);
            if (user == null)
                return BaseResponse<IEnumerable<RequestResponse>>
                    .FailureResponse("User not found in database.");

            // 3) Get all requests by this user
            var requests = await _requestRepo.GetAllByRequesterUserIdAsync(user.Id);

            // 4) Lấy tất cả address IDs duy nhất từ requests
            var addressIds = requests
                .Where(r => r.DeliveryAddressId.HasValue)
                .Select(r => r.DeliveryAddressId!.Value)
                .Distinct()
                .ToList();

            // 5) Fetch tất cả addresses một lần
            var addressesDict = new Dictionary<long, Domain.Addresses.Entities.AddressDomain>();
            foreach (var addressId in addressIds)
            {
                var address = await _addressRepository.GetByIdAsync(addressId);
                if (address != null)
                {
                    addressesDict[addressId] = address;
                }
            }

            // 6) Map requests với address information
            var dtoList = requests.Select(r =>
            {
                var address = r.DeliveryAddressId.HasValue && addressesDict.TryGetValue(r.DeliveryAddressId.Value, out var addr)
                    ? addr
                    : null;

                return new RequestResponse
                {
                    RequestId = r.Id,
                    RequesterUserId = r.RequesterUserId,
                    Urgency = r.Urgency.ToString(),
                    BloodTypeId = r.BloodTypeId,
                    ComponentId = r.ComponentId,
                    QuantityUnits = r.QuantityUnits,
                    NeedBeforeUtc = r.NeedBeforeUtc,
                    DeliveryAddressId = r.DeliveryAddressId,
                    Status = r.Status.ToString(),
                    ClinicalNotes = r.ClinicalNotes,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt,

                    // 🆕 Thông tin địa chỉ
                    DeliveryAddressName = address == null
                        ? null
                        : $"{address.Line1}, {address.District}, {address.City}, {address.Province}",
                    Latitude = address?.Latitude,
                    Longitude = address?.Longitude
                };
            });

            return BaseResponse<IEnumerable<RequestResponse>>
                .SuccessResponse(dtoList);
        }
    }
}
