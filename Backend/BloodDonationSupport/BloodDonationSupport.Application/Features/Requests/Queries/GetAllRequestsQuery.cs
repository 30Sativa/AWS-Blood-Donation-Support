using BloodDonationSupport.Application.Common.Models;
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
    public record GetAllRequestsQuery(int PageNumber, int PageSize=10) : IRequest<PaginatedResponse<RequestResponse>>
    {
    }
}
