using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Application.Common.Models;
using BloodDonationSupport.Application.Features.Users.DTOs.Responses;
using MediatR;
using System.Linq;

namespace BloodDonationSupport.Application.Features.Users.Queries
{
    public record GetUserAuditLogsQuery(long UserId, int PageNumber = 1, int PageSize = 10)
        : IRequest<PaginatedResponse<AuditLogResponse>>;

    public class GetUserAuditLogsQueryHandler
        : IRequestHandler<GetUserAuditLogsQuery, PaginatedResponse<AuditLogResponse>>
    {
        private readonly IAuditLogRepository _auditLogRepository;

        public GetUserAuditLogsQueryHandler(IAuditLogRepository auditLogRepository)
        {
            _auditLogRepository = auditLogRepository;
        }

        public async Task<PaginatedResponse<AuditLogResponse>> Handle(
            GetUserAuditLogsQuery request,
            CancellationToken cancellationToken)
        {
            var (items, totalCount) = await _auditLogRepository.GetByUserIdAsync(
                request.UserId,
                request.PageNumber,
                request.PageSize);

            var responses = items.Select(log => new AuditLogResponse
            {
                AuditId = log.AuditId,
                UserId = log.UserId,
                Action = log.Action,
                EntityType = log.EntityType,
                EntityId = log.EntityId,
                OldValue = log.OldValue,
                NewValue = log.NewValue,
                DetailsJson = log.DetailsJson,
                IpAddress = log.IpAddress,
                CreatedAt = log.CreatedAt
            }).ToList();

            return new PaginatedResponse<AuditLogResponse>
            {
                Items = responses,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                TotalCount = totalCount
            };
        }
    }
}

