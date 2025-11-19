using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Domain.Donors.Entities;
using MediatR;

namespace BloodDonationSupport.Application.Features.Donors.Commands
{
    public class UpdateAvailabilityHandler : IRequestHandler<UpdateAvailabilityCommand, BaseResponse<string>>
    {
        private readonly IDonorRepository _donorRepo;
        private readonly IUnitOfWork _uow;

        public UpdateAvailabilityHandler(IDonorRepository donorRepo, IUnitOfWork uow)
        {
            _donorRepo = donorRepo;
            _uow = uow;
        }

        public async Task<BaseResponse<string>> Handle(
            UpdateAvailabilityCommand command,
            CancellationToken cancellationToken)
        {
            var req = command.Request;

            var donor = await _donorRepo.GetByIdWithAvailabilitiesAsync(req.DonorId);
            if (donor == null)
                return BaseResponse<string>.FailureResponse("Donor not found.");

            // clear old
            donor.ClearAvailabilities();

            // add new
            foreach (var a in req.Availabilities)
            {
                donor.AddAvailability(
                    DonorAvailability.Create(a.Weekday, a.TimeFromMin, a.TimeToMin)
                );
            }

            _donorRepo.Update(donor);
            await _uow.SaveChangesAsync(cancellationToken);

            return BaseResponse<string>.SuccessResponse("Availability updated successfully.");
        }
    }
}