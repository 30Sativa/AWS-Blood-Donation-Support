using BloodDonationSupport.Application.Common.Responses;
using BloodDonationSupport.Application.Features.Users.DTOs.Responses;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Users.Queries
{
    public record GetAllUsersWithProfilesQuery : IRequest<BaseResponse<IEnumerable<GetAllUserWithProfileResponse>>>
    {
    }
}
