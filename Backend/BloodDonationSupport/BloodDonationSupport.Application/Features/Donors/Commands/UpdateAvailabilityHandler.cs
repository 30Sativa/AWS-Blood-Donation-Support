using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Domain.Donors.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Donors.Commands
{
    public class UpdateAvailabilityHandler : IRequestHandler<UpdateAvailabilityCommand, BaseResponse<string>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IDonorRepository _donorRepository;

        public UpdateAvailabilityHandler(IUnitOfWork unitOfWork, IDonorRepository donorRepository)
        {
            _unitOfWork = unitOfWork;
            _donorRepository = donorRepository;
        }

        public async Task<BaseResponse<string>> Handle(UpdateAvailabilityCommand request, CancellationToken cancellationToken)
        {
            var donor = await _donorRepository.GetByIdWithAvailabilitiesAsync(request.DonorId);

            if (donor == null)
                return BaseResponse<string>.FailureResponse("Donor not found.");

            // Xóa lịch cũ
            donor.ClearAvailabilities();

            // Thêm lịch mới
            foreach (var a in request.Request.Availabilities)
            {
                var availability = DonorAvailability.Create(a.Weekday, a.TimeFromMin, a.TimeToMin);
                donor.AddAvailability(availability);
            }

            // Cập nhật DB
            _donorRepository.Update(donor);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return BaseResponse<string>.SuccessResponse("Availability updated successfully.");
        }
    }
}
