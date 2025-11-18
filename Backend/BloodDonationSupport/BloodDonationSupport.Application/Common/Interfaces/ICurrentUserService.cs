namespace BloodDonationSupport.Application.Common.Interfaces
{
    public interface ICurrentUserService
    {
        long? UserId { get; }
        string? CognitoUserId { get; }
        string? Email { get; }
        IReadOnlyCollection<string> Roles { get; }
        bool IsAuthenticated { get; }
    }
}

