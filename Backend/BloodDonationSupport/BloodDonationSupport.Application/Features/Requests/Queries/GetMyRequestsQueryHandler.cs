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

        public GetMyRequestsHandler(
            ICurrentUserService currentUser,
            IUserRepository userRepo,
            IRequestRepository requestRepo)
        {
            _currentUser = currentUser;
            _userRepo = userRepo;
            _requestRepo = requestRepo;
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

            var dtoList = requests.Select(r => new RequestResponse
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
                UpdatedAt = r.UpdatedAt
            });

            return BaseResponse<IEnumerable<RequestResponse>>
                .SuccessResponse(dtoList);
        }
}
