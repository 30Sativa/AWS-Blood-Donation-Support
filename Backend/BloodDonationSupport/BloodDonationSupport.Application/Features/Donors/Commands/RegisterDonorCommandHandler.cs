using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using BloodDonationSupport.Domain.Donors.Entities;
using BloodDonationSupport.Domain.Shared.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Donors.Commands
{
    public class RegisterDonorCommandHandler : IRequestHandler<RegisterDonorCommand, BaseResponse<RegisterDonorResponse>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IDonorRepository _donorRepository;
        private readonly IUserRepository _userRepository;

        public RegisterDonorCommandHandler(IUnitOfWork unitOfWork, IDonorRepository donorRepository, IUserRepository userRepository)
        {
            _unitOfWork = unitOfWork;
            _donorRepository = donorRepository;
            _userRepository = userRepository;
        }
        public async Task<BaseResponse<RegisterDonorResponse>> Handle(RegisterDonorCommand request, CancellationToken cancellationToken)
        {
            var reg = request.request;


            //check user exists
            var user = await _userRepository.GetByIdAsync(reg.UserId);
            if (user == null)
            {
                return BaseResponse<RegisterDonorResponse>.FailureResponse($"User with ID {reg.UserId} does not exist.");
            }
            //check donor exists
            var existingDonor = await _donorRepository.ExistsAsync(d => d.UserId == reg.UserId);
            if (existingDonor)
            {
                return BaseResponse<RegisterDonorResponse>.FailureResponse($"Donor profile for User ID {reg.UserId} already exists.");
            }
            //create donor domain
            var donor = Domain.Donors.Entities.DonorDomain.Create(reg.UserId, reg.TravelRadiusKm);


            if(reg.BloodTypeId.HasValue)
            {
                 donor.SetBloodType(reg.BloodTypeId.Value);
            }
            if(reg.AddressId.HasValue)
            {
                donor.SetAddress(reg.AddressId.Value);
            }
            if(reg.Latitude.HasValue && reg.Longitude.HasValue)
            {
                donor.UpdateLocation(GeoLocation.Create(reg.Latitude.Value, reg.Longitude.Value));
            }
            if(reg.NextEligibleDate.HasValue)
            {
                donor.UpdateEligibility(reg.NextEligibleDate.Value);
            }
            if (reg.IsReady)
            {
                donor.MarkReady(reg.IsReady);
            }
            //add availabilities
            if(reg.Availabilities != null && reg.Availabilities.Any())
            {
                foreach(var availDto in reg.Availabilities)
                {
                    donor.AddAvailability(DonorAvailability.Create(availDto.Weekday, availDto.TimeFromMin, availDto.TimeToMin));
                }
            }

            //add health conditions
            if(reg.HealthConditionIds != null && reg.HealthConditionIds.Any())
            {
                foreach(var condId in reg.HealthConditionIds)
                {
                    donor.AddHealthCondition(DonorHealthCondition.Create(0,condId));
                }
            }
            //save to db
            await _donorRepository.AddAsync(donor);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            //prepare response
            var response = new RegisterDonorResponse
            {
                DonorId = donor.Id,
                UserId = donor.UserId,
                BloodTypeId = donor.BloodTypeId,
                AddressId = donor.AddressId,
                TravelRadiusKm = donor.TravelRadiusKm,
                IsReady = donor.IsReady,
                NextEligibleDate = donor.NextEligibleDate,
                CreatedAt = donor.CreatedAt,
                Latitude = donor.LastKnownLocation?.Latitude,
                Longitude = donor.LastKnownLocation?.Longitude,
                Availabilities = donor.Availabilities
                    .Select(a => new AvailabilityItem
                    {
                        Weekday = a.Weekday,
                        TimeFromMin = a.TimeFromMin,
                        TimeToMin = a.TimeToMin
                    }).ToList(),
                HealthConditions = donor.HealthConditions
                    .Select(h => new HealthConditionItem
                    {
                        ConditionId = h.ConditionId
                    }).ToList()
            };

            return BaseResponse<RegisterDonorResponse>.SuccessResponse(response, "Donor registered successfully.");

        }
    }
}
