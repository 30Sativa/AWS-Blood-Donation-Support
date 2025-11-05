namespace BloodDonationSupport.Infrastructure.Persistence.Models;

public partial class PostTag
{
    public int TagId { get; set; }

    public string TagName { get; set; } = null!;

    public string TagSlug { get; set; } = null!;

    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
}