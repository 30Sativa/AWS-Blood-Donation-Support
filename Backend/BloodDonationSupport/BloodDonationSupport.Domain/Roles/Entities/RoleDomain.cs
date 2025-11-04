using BloodDonationSupport.Domain.Common;

namespace BloodDonationSupport.Domain.Roles.Entities
{
    public class RoleDomain : BaseEntity<int>
    {
        public string Code { get; private set; } = string.Empty; // ADMIN, MEMBER, STAFF
        public string Name { get; private set; } = string.Empty;
        public string? Description { get; private set; }

        private RoleDomain() { } // For EF Core

        private RoleDomain(string code, string name, string? description = null)
        {
            Code = code.ToUpperInvariant();
            Name = name;
            Description = description;
        }

        private RoleDomain(int id, string code, string name, string? description)
        {
            Id = id;
            Code = code;
            Name = name;
            Description = description;
        }

        //  Factory tạo mới
        public static RoleDomain Create(string code, string name, string? description = null)
        {
            return new RoleDomain(code, name, description);
        }

        //  Rehydrate khi đọc từ DB
        public static RoleDomain Rehydrate(int id, string code, string name, string? description)
        {
            return new RoleDomain(id, code, name, description);
        }

        // Update mô tả (dành cho admin)
        public void Update(string? name = null, string? description = null)
        {
            if (!string.IsNullOrWhiteSpace(name))
                Name = name;
            if (description != null)
                Description = description;
        }
    }
}
