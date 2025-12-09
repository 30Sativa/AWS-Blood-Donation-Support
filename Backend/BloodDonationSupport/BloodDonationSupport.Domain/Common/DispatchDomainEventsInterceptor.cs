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

        // ✅ Publish events AFTER SaveChanges has completed successfully
        public override async ValueTask<int> SavedChangesAsync(
            SaveChangesCompletedEventData eventData,
            int result,
            CancellationToken cancellationToken = default)
        {
            var context = eventData.Context;
            if (context == null)
                return result;

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

            // ✅ must return result to match ValueTask<int>
            return result;
        }
    }
}