using BloodDonationSupport.Application.Common.Models;
using BloodDonationSupport.Application.Features.Donors.DTOs.Response;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BloodDonationSupport.Application.Features.Donors.Queries
{
    public record GetAllDonorsQuery(int PageNumber = 1, int PageSize = 10) : IRequest<PaginatedResponse<DonorResponse>>
    {
    }
}
