using AutoMapper;
using BloodDonationSupport.Application.Features.Users.DTOs.Responses;
using BloodDonationSupport.Domain.Users.Entities;

namespace BloodDonationSupport.Application.Common.Mappings
{
    public class UserMappingProfile : Profile
    {
        public UserMappingProfile()
        {
            // Create your mappings here
            // Example:
            // CreateMap<Source, Destination>();
            CreateMap<UserDomain, UserResponse>().ReverseMap();
        }
    }
}