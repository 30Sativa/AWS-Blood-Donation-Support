using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace BloodDonationSupport.Infrastructure.Persistence.Contexts
{
    public partial class AppDbContext : DbContext
    {
        public AppDbContext()
        {
        }

        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        #region DbSets

        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<Role> Roles { get; set; }
        public virtual DbSet<UserRole> UserRoles { get; set; }

        public virtual DbSet<Address> Addresses { get; set; }
        public virtual DbSet<Appointment> Appointments { get; set; }
        public virtual DbSet<Match> Matches { get; set; }
        public virtual DbSet<HealthCondition> HealthConditions { get; set; }
        public virtual DbSet<BloodComponent> BloodComponents { get; set; }
        public virtual DbSet<BloodType> BloodTypes { get; set; }
        public virtual DbSet<Donation> Donations { get; set; }
        public virtual DbSet<Donor> Donors { get; set; }
        public virtual DbSet<Request> Requests { get; set; }
        public virtual DbSet<Notification> Notifications { get; set; }
        public virtual DbSet<UserProfile> UserProfiles { get; set; }
        public virtual DbSet<S3Attachment> S3Attachments { get; set; }
        public virtual DbSet<QcTest> QcTests { get; set; }
        public virtual DbSet<Reminder> Reminders { get; set; }
        public virtual DbSet<AuditLog> AuditLogs { get; set; }
        public virtual DbSet<CompatibilityMatrix> CompatibilityMatrix { get; set; }
        // Blogging
        public virtual DbSet<Post> Posts { get; set; }

        public virtual DbSet<PostTag> PostTags { get; set; }

        #endregion DbSets

        #region Configuration

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            // ⚙️ Load connection string from appsettings.json if not injected
            if (!optionsBuilder.IsConfigured)
            {
                var configuration = new ConfigurationBuilder()
                    .SetBasePath(Directory.GetCurrentDirectory())
                    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                    .Build();

                var connectionString = configuration.GetConnectionString("DBDefault");
                optionsBuilder.UseSqlServer(connectionString);
            }
        }

        #endregion Configuration

        #region Model Configuration

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ✅ Tự động apply tất cả configuration từ assembly hiện tại
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

            // ✅ Optional: Seed default roles (nếu có file RoleSeed.cs)
            // modelBuilder.SeedRoles();
        }

        #endregion Model Configuration
    }
}