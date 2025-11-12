using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Requests.DTOs.Response;
using BloodDonationSupport.Domain.Requests.Entities;
using BloodDonationSupport.Domain.Requests.Enums;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Requests.Commands
{
    public class RegisterRequestCommandHandler : IRequestHandler<RegisterRequestCommand, BaseResponse<RegisterRequestResponse>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRequestRepository _requestRepository;
        private readonly IUserRepository _userRepository;


        public RegisterRequestCommandHandler(IUnitOfWork unitOfWork, IRequestRepository requestRepository, IUserRepository userRepository)
        {
            _unitOfWork = unitOfWork;
            _requestRepository = requestRepository;
            _userRepository = userRepository;
        }


        public async Task<BaseResponse<RegisterRequestResponse>> Handle(RegisterRequestCommand request, CancellationToken cancellationToken)
        {
            var dto = request.request;

            //check if requester user exists
            var user =  await _userRepository.GetByIdAsync(dto.RequesterUserId);
            if(user ==null)
            {
                return BaseResponse<RegisterRequestResponse>.FailureResponse("Requester user not found.");
            }

            //parse urgency(string -> enum)
            if (!Enum.TryParse(dto.Urgency, true, out UrgencyLevel urgency))
                urgency = UrgencyLevel.NORMAL;

            //create new request domain
            var newRequest = RequestDomain.Create(
                dto.RequesterUserId,
                urgency,
                dto.BloodTypeId,
                dto.ComponentId,
                dto.QuantityUnits,
                dto.NeedBeforeUtc,
                dto.DeliveryAddressId,
                dto.ClinicalNotes
            );

            //add to db
            await _requestRepository.AddAsync(newRequest);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            //prepare response dto
            var response = new RegisterRequestResponse
            {
                RequestId = newRequest.Id,
                RequesterUserId = newRequest.RequesterUserId,
                Urgency = newRequest.Urgency.ToString(),
                BloodTypeId = newRequest.BloodTypeId,
                ComponentId = newRequest.ComponentId,
                QuantityUnits = newRequest.QuantityUnits,
                Status = newRequest.Status.ToString(),
                CreatedAt = newRequest.CreatedAt
            };

            return BaseResponse<RegisterRequestResponse>.SuccessResponse(response, "Request registered successfully.");
        }
    }
}
