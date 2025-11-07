using MediatR;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace BloodDonationSupport.Domain.Common
{
    public class DispatchDomainEventsInterceptor : SaveChangesInterceptor
    {
        private readonly IMediator _mediator;

        public DispatchDomainEventsInterceptor(IMediator mediator)
        {
            _mediator = mediator;
        }

        public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
        {
            var context = eventData.Context;
            if (context == null)
                return await base.SavingChangesAsync(eventData, result, cancellationToken);

            var entities = context.ChangeTracker
                .Entries()
                .Where(e => e.Entity is BaseEntity<long> be && be.DomainEvents.Any())
                .Select(e => (BaseEntity<long>)e.Entity)
                .ToList();

            foreach (var entity in entities)
            {
                var events = entity.DomainEvents.ToList();
                entity.ClearDomainEvents();

                foreach (var domainEvent in events)
                    await _mediator.Publish(domainEvent, cancellationToken);
            }

            return await base.SavingChangesAsync(eventData, result, cancellationToken);
        }
    }
}