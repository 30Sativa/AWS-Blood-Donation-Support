namespace BloodDonationSupport.Domain.Common
{
    public abstract class AggregateRoot<TId> : BaseEntity<TId>
    {
        protected static void CheckRule(IBusinessRule rule)
        {
            if (rule.IsBroken())
                throw new DomainException(rule.Message);
        }
    }
}