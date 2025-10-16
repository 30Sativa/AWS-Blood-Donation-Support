using System;
using System.Collections.Generic;
using BloodDonationSupport.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace BloodDonationSupport.Infrastructure.Persistence;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Address> Addresses { get; set; }

    public virtual DbSet<Appointment> Appointments { get; set; }

    public virtual DbSet<AuditLog> AuditLogs { get; set; }

    public virtual DbSet<BloodComponent> BloodComponents { get; set; }

    public virtual DbSet<BloodType> BloodTypes { get; set; }

    public virtual DbSet<CompatibilityMatrix> CompatibilityMatrices { get; set; }

    public virtual DbSet<ComponentShelfLife> ComponentShelfLives { get; set; }

    public virtual DbSet<Config> Configs { get; set; }

    public virtual DbSet<Donation> Donations { get; set; }

    public virtual DbSet<DonationAttempt> DonationAttempts { get; set; }

    public virtual DbSet<Donor> Donors { get; set; }

    public virtual DbSet<DonorAvailability> DonorAvailabilities { get; set; }

    public virtual DbSet<DonorHealthCondition> DonorHealthConditions { get; set; }

    public virtual DbSet<FailedLoginAttempt> FailedLoginAttempts { get; set; }

    public virtual DbSet<HealthCondition> HealthConditions { get; set; }

    public virtual DbSet<HealthcareFacility> HealthcareFacilities { get; set; }

    public virtual DbSet<InventoryUnit> InventoryUnits { get; set; }

    public virtual DbSet<LambdaExecution> LambdaExecutions { get; set; }

    public virtual DbSet<Match> Matches { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<Post> Posts { get; set; }

    public virtual DbSet<PostTag> PostTags { get; set; }

    public virtual DbSet<QcTest> QcTests { get; set; }

    public virtual DbSet<RecoveryPolicy> RecoveryPolicies { get; set; }

    public virtual DbSet<Reminder> Reminders { get; set; }

    public virtual DbSet<Request> Requests { get; set; }

    public virtual DbSet<RequestEvent> RequestEvents { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<S3Attachment> S3Attachments { get; set; }

    public virtual DbSet<SlaConfig> SlaConfigs { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserProfile> UserProfiles { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Data Source=(local);Database=Test_Bloood;User Id=sa;Password=12345;TrustServerCertificate=true;Encrypt=false;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Address>(entity =>
        {
            entity.HasKey(e => e.AddressId).HasName("PK__addresse__CAA247C8E3C350B8");

            entity.ToTable("addresses");

            entity.Property(e => e.AddressId).HasColumnName("address_id");
            entity.Property(e => e.City)
                .HasMaxLength(100)
                .HasColumnName("city");
            entity.Property(e => e.ConfidenceScore)
                .HasColumnType("decimal(3, 2)")
                .HasColumnName("confidence_score");
            entity.Property(e => e.Country)
                .HasMaxLength(100)
                .HasDefaultValue("Vietnam")
                .HasColumnName("country");
            entity.Property(e => e.District)
                .HasMaxLength(100)
                .HasColumnName("district");
            entity.Property(e => e.Line1)
                .HasMaxLength(255)
                .HasColumnName("line1");
            entity.Property(e => e.NormalizedAddress)
                .HasMaxLength(500)
                .HasColumnName("normalized_address");
            entity.Property(e => e.PlaceId)
                .HasMaxLength(100)
                .HasColumnName("place_id");
            entity.Property(e => e.PostalCode)
                .HasMaxLength(20)
                .HasColumnName("postal_code");
            entity.Property(e => e.Province)
                .HasMaxLength(100)
                .HasColumnName("province");
        });

        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.HasKey(e => e.AppointmentId).HasName("PK__appointm__A50828FC84B78E57");

            entity.ToTable("appointments");

            entity.HasIndex(e => e.DonorId, "IX_appointments_donor");

            entity.HasIndex(e => e.RequestId, "IX_appointments_req");

            entity.HasIndex(e => new { e.ScheduledAt, e.Status }, "IX_appointments_scheduled");

            entity.Property(e => e.AppointmentId).HasColumnName("appointment_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.DonorId).HasColumnName("donor_id");
            entity.Property(e => e.LocationId).HasColumnName("location_id");
            entity.Property(e => e.RequestId).HasColumnName("request_id");
            entity.Property(e => e.ScheduledAt).HasColumnName("scheduled_at");
            entity.Property(e => e.Status)
                .HasMaxLength(30)
                .HasDefaultValue("SCHEDULED")
                .HasColumnName("status");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.Appointments)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__appointme__creat__18EBB532");

            entity.HasOne(d => d.Donor).WithMany(p => p.Appointments)
                .HasForeignKey(d => d.DonorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__appointme__donor__17036CC0");

            entity.HasOne(d => d.Location).WithMany(p => p.Appointments)
                .HasForeignKey(d => d.LocationId)
                .HasConstraintName("FK__appointme__locat__17F790F9");

            entity.HasOne(d => d.Request).WithMany(p => p.Appointments)
                .HasForeignKey(d => d.RequestId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__appointme__reque__160F4887");
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.AuditId).HasName("PK__audit_lo__5AF33E33F7935D01");

            entity.ToTable("audit_logs");

            entity.HasIndex(e => e.CreatedAt, "IX_audit_logs_created").IsDescending();

            entity.HasIndex(e => new { e.EntityType, e.EntityId }, "IX_audit_logs_entity");

            entity.Property(e => e.AuditId).HasColumnName("audit_id");
            entity.Property(e => e.Action)
                .HasMaxLength(100)
                .HasColumnName("action");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.DetailsJson).HasColumnName("details_json");
            entity.Property(e => e.EntityId)
                .HasMaxLength(100)
                .HasColumnName("entity_id");
            entity.Property(e => e.EntityType)
                .HasMaxLength(100)
                .HasColumnName("entity_type");
            entity.Property(e => e.IpAddress)
                .HasMaxLength(50)
                .HasColumnName("ip_address");
            entity.Property(e => e.NewValue).HasColumnName("new_value");
            entity.Property(e => e.OldValue).HasColumnName("old_value");
            entity.Property(e => e.UserId).HasColumnName("user_id");
        });

        modelBuilder.Entity<BloodComponent>(entity =>
        {
            entity.HasKey(e => e.ComponentId).HasName("PK__blood_co__AEB1DA59340B2E10");

            entity.ToTable("blood_components");

            entity.HasIndex(e => e.ComponentCode, "UQ__blood_co__E2D26DB88C8F56F8").IsUnique();

            entity.Property(e => e.ComponentId).HasColumnName("component_id");
            entity.Property(e => e.ComponentCode)
                .HasMaxLength(20)
                .HasColumnName("component_code");
            entity.Property(e => e.ComponentName)
                .HasMaxLength(100)
                .HasColumnName("component_name");
            entity.Property(e => e.Description)
                .HasMaxLength(500)
                .HasColumnName("description");
        });

        modelBuilder.Entity<BloodType>(entity =>
        {
            entity.HasKey(e => e.BloodTypeId).HasName("PK__blood_ty__56FFB8C88F238DE2");

            entity.ToTable("blood_types");

            entity.HasIndex(e => new { e.Abo, e.Rh }, "UQ__blood_ty__CD71B5E2660D451E").IsUnique();

            entity.Property(e => e.BloodTypeId).HasColumnName("blood_type_id");
            entity.Property(e => e.Abo)
                .HasMaxLength(2)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("abo");
            entity.Property(e => e.Rh)
                .HasMaxLength(1)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("rh");
        });

        modelBuilder.Entity<CompatibilityMatrix>(entity =>
        {
            entity.HasKey(e => new { e.FromBloodTypeId, e.ToBloodTypeId, e.ComponentId }).HasName("PK__compatib__D0C4EFABB7A56EF2");

            entity.ToTable("compatibility_matrix");

            entity.Property(e => e.FromBloodTypeId).HasColumnName("from_blood_type_id");
            entity.Property(e => e.ToBloodTypeId).HasColumnName("to_blood_type_id");
            entity.Property(e => e.ComponentId).HasColumnName("component_id");
            entity.Property(e => e.IsCompatible).HasColumnName("is_compatible");
            entity.Property(e => e.PriorityLevel)
                .HasDefaultValue(0)
                .HasColumnName("priority_level");

            entity.HasOne(d => d.Component).WithMany(p => p.CompatibilityMatrices)
                .HasForeignKey(d => d.ComponentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__compatibi__compo__6B24EA82");

            entity.HasOne(d => d.FromBloodType).WithMany(p => p.CompatibilityMatrixFromBloodTypes)
                .HasForeignKey(d => d.FromBloodTypeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__compatibi__from___693CA210");

            entity.HasOne(d => d.ToBloodType).WithMany(p => p.CompatibilityMatrixToBloodTypes)
                .HasForeignKey(d => d.ToBloodTypeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__compatibi__to_bl__6A30C649");
        });

        modelBuilder.Entity<ComponentShelfLife>(entity =>
        {
            entity.HasKey(e => e.ShelfId).HasName("PK__componen__E33A5B7C9147E7A6");

            entity.ToTable("component_shelf_life");

            entity.HasIndex(e => e.ComponentId, "UQ__componen__AEB1DA58E6259FA4").IsUnique();

            entity.Property(e => e.ShelfId).HasColumnName("shelf_id");
            entity.Property(e => e.ComponentId).HasColumnName("component_id");
            entity.Property(e => e.ShelfDays).HasColumnName("shelf_days");

            entity.HasOne(d => d.Component).WithOne(p => p.ComponentShelfLife)
                .HasForeignKey<ComponentShelfLife>(d => d.ComponentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__component__compo__690797E6");
        });

        modelBuilder.Entity<Config>(entity =>
        {
            entity.HasKey(e => e.ConfigKey).HasName("PK__configs__BDF6033C8B848DB1");

            entity.ToTable("configs");

            entity.Property(e => e.ConfigKey)
                .HasMaxLength(100)
                .HasColumnName("config_key");
            entity.Property(e => e.ConfigType)
                .HasMaxLength(30)
                .HasDefaultValue("STRING")
                .HasColumnName("config_type");
            entity.Property(e => e.ConfigValue)
                .HasMaxLength(4000)
                .HasColumnName("config_value");
            entity.Property(e => e.Description)
                .HasMaxLength(500)
                .HasColumnName("description");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("updated_at");
            entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");
        });

        modelBuilder.Entity<Donation>(entity =>
        {
            entity.HasKey(e => e.DonationId).HasName("PK__donation__296B91DC1D235E8F");

            entity.ToTable("donations");

            entity.HasIndex(e => new { e.DonorId, e.CollectedAt }, "IX_donations_donor");

            entity.Property(e => e.DonationId).HasColumnName("donation_id");
            entity.Property(e => e.AppointmentId).HasColumnName("appointment_id");
            entity.Property(e => e.CollectedAt).HasColumnName("collected_at");
            entity.Property(e => e.ComponentType)
                .HasMaxLength(20)
                .HasColumnName("component_type");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.DonorId).HasColumnName("donor_id");
            entity.Property(e => e.Notes)
                .HasMaxLength(500)
                .HasColumnName("notes");
            entity.Property(e => e.UnitsDonated).HasColumnName("units_donated");
            entity.Property(e => e.VolumeMl).HasColumnName("volume_ml");

            entity.HasOne(d => d.Appointment).WithMany(p => p.Donations)
                .HasForeignKey(d => d.AppointmentId)
                .HasConstraintName("FK__donations__appoi__1EA48E88");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.Donations)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__donations__creat__1F98B2C1");

            entity.HasOne(d => d.Donor).WithMany(p => p.Donations)
                .HasForeignKey(d => d.DonorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__donations__donor__1DB06A4F");
        });

        modelBuilder.Entity<DonationAttempt>(entity =>
        {
            entity.HasKey(e => e.AttemptId).HasName("PK__donation__5621F94952C90BBE");

            entity.ToTable("donation_attempts");

            entity.Property(e => e.AttemptId).HasColumnName("attempt_id");
            entity.Property(e => e.AppointmentId).HasColumnName("appointment_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.Reason)
                .HasMaxLength(500)
                .HasColumnName("reason");
            entity.Property(e => e.Status)
                .HasMaxLength(30)
                .HasDefaultValue("COMPLETED")
                .HasColumnName("status");

            entity.HasOne(d => d.Appointment).WithMany(p => p.DonationAttempts)
                .HasForeignKey(d => d.AppointmentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__donation___appoi__3D2915A8");
        });

        modelBuilder.Entity<Donor>(entity =>
        {
            entity.HasKey(e => e.DonorId).HasName("PK__donors__8B5B10F907E1EA48");

            entity.ToTable("donors");

            entity.HasIndex(e => new { e.BloodTypeId, e.IsReady }, "IX_donors_blood_ready");

            entity.HasIndex(e => e.UserId, "UQ__donors__B9BE370E3E52E2E1").IsUnique();

            entity.Property(e => e.DonorId).HasColumnName("donor_id");
            entity.Property(e => e.AddressId).HasColumnName("address_id");
            entity.Property(e => e.BloodTypeId).HasColumnName("blood_type_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.IsReady).HasColumnName("is_ready");
            entity.Property(e => e.LocationUpdatedAt).HasColumnName("location_updated_at");
            entity.Property(e => e.NextEligibleDate).HasColumnName("next_eligible_date");
            entity.Property(e => e.TravelRadiusKm)
                .HasDefaultValue(10m)
                .HasColumnType("decimal(5, 2)")
                .HasColumnName("travel_radius_km");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Address).WithMany(p => p.Donors)
                .HasForeignKey(d => d.AddressId)
                .HasConstraintName("FK__donors__address___7A672E12");

            entity.HasOne(d => d.BloodType).WithMany(p => p.Donors)
                .HasForeignKey(d => d.BloodTypeId)
                .HasConstraintName("FK__donors__blood_ty__797309D9");

            entity.HasOne(d => d.User).WithOne(p => p.Donor)
                .HasForeignKey<Donor>(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__donors__user_id__787EE5A0");
        });

        modelBuilder.Entity<DonorAvailability>(entity =>
        {
            entity.HasKey(e => e.AvailabilityId).HasName("PK__donor_av__86E3A8015D8326D9");

            entity.ToTable("donor_availability");

            entity.HasIndex(e => e.DonorId, "IX_donor_availability_donor");

            entity.Property(e => e.AvailabilityId).HasColumnName("availability_id");
            entity.Property(e => e.DonorId).HasColumnName("donor_id");
            entity.Property(e => e.TimeFromMin).HasColumnName("time_from_min");
            entity.Property(e => e.TimeToMin).HasColumnName("time_to_min");
            entity.Property(e => e.Weekday).HasColumnName("weekday");

            entity.HasOne(d => d.Donor).WithMany(p => p.DonorAvailabilities)
                .HasForeignKey(d => d.DonorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__donor_ava__donor__01142BA1");
        });

        modelBuilder.Entity<DonorHealthCondition>(entity =>
        {
            entity.HasKey(e => new { e.DonorId, e.ConditionId }).HasName("PK__donor_he__C3096A486E1897A6");

            entity.ToTable("donor_health_conditions");

            entity.Property(e => e.DonorId).HasColumnName("donor_id");
            entity.Property(e => e.ConditionId).HasColumnName("condition_id");

            entity.HasOne(d => d.Condition).WithMany(p => p.DonorHealthConditions)
                .HasForeignKey(d => d.ConditionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__donor_hea__condi__71D1E811");
        });

        modelBuilder.Entity<FailedLoginAttempt>(entity =>
        {
            entity.HasKey(e => e.AttemptId).HasName("PK__failed_l__5621F949E3CCB5BA");

            entity.ToTable("failed_login_attempts");

            entity.HasIndex(e => new { e.Email, e.AttemptedAt }, "IX_failed_logins_email");

            entity.Property(e => e.AttemptId).HasColumnName("attempt_id");
            entity.Property(e => e.AttemptedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("attempted_at");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.IpAddress)
                .HasMaxLength(50)
                .HasColumnName("ip_address");
            entity.Property(e => e.UserAgent)
                .HasMaxLength(500)
                .HasColumnName("user_agent");
        });

        modelBuilder.Entity<HealthCondition>(entity =>
        {
            entity.HasKey(e => e.ConditionId).HasName("PK__health_c__8527AB15B15B4FBD");

            entity.ToTable("health_conditions");

            entity.HasIndex(e => e.ConditionCode, "UQ__health_c__3134F2C1770DA075").IsUnique();

            entity.Property(e => e.ConditionId).HasColumnName("condition_id");
            entity.Property(e => e.ConditionCode)
                .HasMaxLength(50)
                .HasColumnName("condition_code");
            entity.Property(e => e.ConditionName)
                .HasMaxLength(200)
                .HasColumnName("condition_name");
            entity.Property(e => e.IsDonationEligible).HasColumnName("is_donation_eligible");
        });

        modelBuilder.Entity<HealthcareFacility>(entity =>
        {
            entity.HasKey(e => e.FacilityId).HasName("PK__healthca__B2E8EAAED9A65F52");

            entity.ToTable("healthcare_facilities");

            entity.Property(e => e.FacilityId).HasColumnName("facility_id");
            entity.Property(e => e.AddressId).HasColumnName("address_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.Description)
                .HasMaxLength(1000)
                .HasColumnName("description");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.FacilityName)
                .HasMaxLength(300)
                .HasColumnName("facility_name");
            entity.Property(e => e.Phone)
                .HasMaxLength(30)
                .HasColumnName("phone");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasOne(d => d.Address).WithMany(p => p.HealthcareFacilities)
                .HasForeignKey(d => d.AddressId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__healthcar__addre__5DCAEF64");
        });

        modelBuilder.Entity<InventoryUnit>(entity =>
        {
            entity.HasKey(e => e.UnitId).HasName("PK__inventor__D3AF5BD7E5491A18");

            entity.ToTable("inventory_units");

            entity.HasIndex(e => new { e.Status, e.ComponentId, e.BloodTypeId, e.ExpiresAt }, "IX_inventory_available");

            entity.HasIndex(e => new { e.ExpiresAt, e.Status }, "IX_inventory_expires");

            entity.HasIndex(e => e.UnitCode, "UQ__inventor__57BE719A80A284AC").IsUnique();

            entity.Property(e => e.UnitId).HasColumnName("unit_id");
            entity.Property(e => e.BloodTypeId).HasColumnName("blood_type_id");
            entity.Property(e => e.CollectedAt).HasColumnName("collected_at");
            entity.Property(e => e.ComponentId).HasColumnName("component_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.DonationId).HasColumnName("donation_id");
            entity.Property(e => e.ExpiresAt).HasColumnName("expires_at");
            entity.Property(e => e.ReservedForRequestId).HasColumnName("reserved_for_request_id");
            entity.Property(e => e.Status)
                .HasMaxLength(30)
                .HasDefaultValue("QUARANTINE")
                .HasColumnName("status");
            entity.Property(e => e.StoragePlace)
                .HasMaxLength(100)
                .HasColumnName("storage_place");
            entity.Property(e => e.UnitCode)
                .HasMaxLength(64)
                .HasColumnName("unit_code");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.VolumeMl).HasColumnName("volume_ml");

            entity.HasOne(d => d.BloodType).WithMany(p => p.InventoryUnits)
                .HasForeignKey(d => d.BloodTypeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__inventory__blood__282DF8C2");

            entity.HasOne(d => d.Component).WithMany(p => p.InventoryUnits)
                .HasForeignKey(d => d.ComponentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__inventory__compo__29221CFB");

            entity.HasOne(d => d.Donation).WithMany(p => p.InventoryUnits)
                .HasForeignKey(d => d.DonationId)
                .HasConstraintName("FK__inventory__donat__2739D489");

            entity.HasOne(d => d.ReservedForRequest).WithMany(p => p.InventoryUnits)
                .HasForeignKey(d => d.ReservedForRequestId)
                .HasConstraintName("FK__inventory__reser__2A164134");
        });

        modelBuilder.Entity<LambdaExecution>(entity =>
        {
            entity.HasKey(e => e.ExecutionId).HasName("PK__lambda_e__360496AA51746470");

            entity.ToTable("lambda_executions");

            entity.Property(e => e.ExecutionId)
                .HasMaxLength(100)
                .HasColumnName("execution_id");
            entity.Property(e => e.CompletedAt).HasColumnName("completed_at");
            entity.Property(e => e.ErrorMessage)
                .HasMaxLength(1000)
                .HasColumnName("error_message");
            entity.Property(e => e.FunctionName)
                .HasMaxLength(100)
                .HasColumnName("function_name");
            entity.Property(e => e.ItemsProcessed).HasColumnName("items_processed");
            entity.Property(e => e.StartedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("started_at");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasColumnName("status");
        });

        modelBuilder.Entity<Match>(entity =>
        {
            entity.HasKey(e => e.MatchId).HasName("PK__matches__9D7FCBA3764A65DC");

            entity.ToTable("matches");

            entity.HasIndex(e => new { e.RequestId, e.Status }, "IX_matches_request");

            entity.Property(e => e.MatchId).HasColumnName("match_id");
            entity.Property(e => e.CompatibilityScore)
                .HasColumnType("decimal(5, 2)")
                .HasColumnName("compatibility_score");
            entity.Property(e => e.ContactedAt).HasColumnName("contacted_at");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.DistanceKm)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("distance_km");
            entity.Property(e => e.DonorId).HasColumnName("donor_id");
            entity.Property(e => e.RequestId).HasColumnName("request_id");
            entity.Property(e => e.Response)
                .HasMaxLength(20)
                .HasColumnName("response");
            entity.Property(e => e.Status)
                .HasMaxLength(30)
                .HasDefaultValue("PROPOSED")
                .HasColumnName("status");

            entity.HasOne(d => d.Donor).WithMany(p => p.Matches)
                .HasForeignKey(d => d.DonorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__matches__donor_i__37703C52");

            entity.HasOne(d => d.Request).WithMany(p => p.Matches)
                .HasForeignKey(d => d.RequestId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__matches__request__367C1819");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId).HasName("PK__notifica__E059842F00929565");

            entity.ToTable("notifications");

            entity.HasIndex(e => e.AwsMessageId, "IX_notifications_aws_msg");

            entity.HasIndex(e => new { e.UserId, e.Status }, "IX_notifications_user_status");

            entity.Property(e => e.NotificationId).HasColumnName("notification_id");
            entity.Property(e => e.AwsMessageId)
                .HasMaxLength(100)
                .HasColumnName("aws_message_id");
            entity.Property(e => e.Channel)
                .HasMaxLength(20)
                .HasDefaultValue("EMAIL")
                .HasColumnName("channel");
            entity.Property(e => e.ClickedAt).HasColumnName("clicked_at");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.DeliveryStatus)
                .HasMaxLength(20)
                .HasColumnName("delivery_status");
            entity.Property(e => e.ErrorMessage)
                .HasMaxLength(500)
                .HasColumnName("error_message");
            entity.Property(e => e.OpenedAt).HasColumnName("opened_at");
            entity.Property(e => e.PayloadJson).HasColumnName("payload_json");
            entity.Property(e => e.SentAt).HasColumnName("sent_at");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("QUEUED")
                .HasColumnName("status");
            entity.Property(e => e.TemplateCode)
                .HasMaxLength(50)
                .HasColumnName("template_code");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__notificat__user___4A8310C6");
        });

        modelBuilder.Entity<Post>(entity =>
        {
            entity.HasKey(e => e.PostId).HasName("PK__posts__3ED78766041B2C23");

            entity.ToTable("posts");

            entity.HasIndex(e => new { e.PublishedAt, e.IsPublished }, "IX_posts_published");

            entity.HasIndex(e => e.Slug, "UQ__posts__32DD1E4C84A04016").IsUnique();

            entity.Property(e => e.PostId).HasColumnName("post_id");
            entity.Property(e => e.AuthorId).HasColumnName("author_id");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.Excerpt)
                .HasMaxLength(1000)
                .HasColumnName("excerpt");
            entity.Property(e => e.IsPublished).HasColumnName("is_published");
            entity.Property(e => e.PublishedAt).HasColumnName("published_at");
            entity.Property(e => e.Slug)
                .HasMaxLength(500)
                .HasColumnName("slug");
            entity.Property(e => e.Title)
                .HasMaxLength(500)
                .HasColumnName("title");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasOne(d => d.Author).WithMany(p => p.Posts)
                .HasForeignKey(d => d.AuthorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__posts__author_id__540C7B00");

            entity.HasMany(d => d.Tags).WithMany(p => p.Posts)
                .UsingEntity<Dictionary<string, object>>(
                    "PostTagMapping",
                    r => r.HasOne<PostTag>().WithMany()
                        .HasForeignKey("TagId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__post_tag___tag_i__5BAD9CC8"),
                    l => l.HasOne<Post>().WithMany()
                        .HasForeignKey("PostId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__post_tag___post___5AB9788F"),
                    j =>
                    {
                        j.HasKey("PostId", "TagId").HasName("PK__post_tag__4AFEED4D2AE19321");
                        j.ToTable("post_tag_mappings");
                        j.IndexerProperty<long>("PostId").HasColumnName("post_id");
                        j.IndexerProperty<int>("TagId").HasColumnName("tag_id");
                    });
        });

        modelBuilder.Entity<PostTag>(entity =>
        {
            entity.HasKey(e => e.TagId).HasName("PK__post_tag__4296A2B6822C2F5E");

            entity.ToTable("post_tags");

            entity.HasIndex(e => e.TagSlug, "UQ__post_tag__2DE61834B72F594E").IsUnique();

            entity.HasIndex(e => e.TagName, "UQ__post_tag__E298655C1D884C06").IsUnique();

            entity.Property(e => e.TagId).HasColumnName("tag_id");
            entity.Property(e => e.TagName)
                .HasMaxLength(100)
                .HasColumnName("tag_name");
            entity.Property(e => e.TagSlug)
                .HasMaxLength(100)
                .HasColumnName("tag_slug");
        });

        modelBuilder.Entity<QcTest>(entity =>
        {
            entity.HasKey(e => e.QcId).HasName("PK__qc_tests__08434F6CB3E039F1");

            entity.ToTable("qc_tests");

            entity.Property(e => e.QcId).HasColumnName("qc_id");
            entity.Property(e => e.Notes)
                .HasMaxLength(500)
                .HasColumnName("notes");
            entity.Property(e => e.QcStatus)
                .HasMaxLength(20)
                .HasDefaultValue("PENDING")
                .HasColumnName("qc_status");
            entity.Property(e => e.ResultsJson).HasColumnName("results_json");
            entity.Property(e => e.TestedAt).HasColumnName("tested_at");
            entity.Property(e => e.TestedBy).HasColumnName("tested_by");
            entity.Property(e => e.UnitId).HasColumnName("unit_id");

            entity.HasOne(d => d.TestedByNavigation).WithMany(p => p.QcTests)
                .HasForeignKey(d => d.TestedBy)
                .HasConstraintName("FK__qc_tests__tested__2FCF1A8A");

            entity.HasOne(d => d.Unit).WithMany(p => p.QcTests)
                .HasForeignKey(d => d.UnitId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__qc_tests__unit_i__2EDAF651");
        });

        modelBuilder.Entity<RecoveryPolicy>(entity =>
        {
            entity.HasKey(e => e.PolicyId).HasName("PK__recovery__47DA3F03DD17389D");

            entity.ToTable("recovery_policy");

            entity.HasIndex(e => e.ComponentId, "UQ__recovery__AEB1DA58F97650F0").IsUnique();

            entity.Property(e => e.PolicyId).HasColumnName("policy_id");
            entity.Property(e => e.ComponentId).HasColumnName("component_id");
            entity.Property(e => e.MinDays).HasColumnName("min_days");

            entity.HasOne(d => d.Component).WithOne(p => p.RecoveryPolicy)
                .HasForeignKey<RecoveryPolicy>(d => d.ComponentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__recovery___compo__6442E2C9");
        });

        modelBuilder.Entity<Reminder>(entity =>
        {
            entity.HasKey(e => e.ReminderId).HasName("PK__reminder__E27A36287B708B6A");

            entity.ToTable("reminders");

            entity.HasIndex(e => new { e.DonorId, e.TargetDate, e.SentAt }, "IX_reminders_donor_date");

            entity.HasIndex(e => new { e.SentAt, e.IsSnoozed }, "IX_reminders_pending").HasFilter("([sent_at] IS NULL AND [is_snoozed]=(0))");

            entity.Property(e => e.ReminderId).HasColumnName("reminder_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.DonorId).HasColumnName("donor_id");
            entity.Property(e => e.IsSnoozed).HasColumnName("is_snoozed");
            entity.Property(e => e.LastAttemptAt).HasColumnName("last_attempt_at");
            entity.Property(e => e.ProcessedBatchId)
                .HasMaxLength(50)
                .HasColumnName("processed_batch_id");
            entity.Property(e => e.ReminderType)
                .HasMaxLength(50)
                .HasColumnName("reminder_type");
            entity.Property(e => e.RetryCount).HasColumnName("retry_count");
            entity.Property(e => e.SentAt).HasColumnName("sent_at");
            entity.Property(e => e.SnoozeUntil).HasColumnName("snooze_until");
            entity.Property(e => e.TargetDate).HasColumnName("target_date");

            entity.HasOne(d => d.Donor).WithMany(p => p.Reminders)
                .HasForeignKey(d => d.DonorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__reminders__donor__42E1EEFE");
        });

        modelBuilder.Entity<Request>(entity =>
        {
            entity.HasKey(e => e.RequestId).HasName("PK__requests__18D3B90F762B0862");

            entity.ToTable("requests");

            entity.HasIndex(e => e.NeedBeforeUtc, "IX_requests_deadline");

            entity.HasIndex(e => e.Status, "IX_requests_status");

            entity.HasIndex(e => new { e.Urgency, e.CreatedAt }, "IX_requests_urgency_created");

            entity.Property(e => e.RequestId).HasColumnName("request_id");
            entity.Property(e => e.BloodTypeId).HasColumnName("blood_type_id");
            entity.Property(e => e.ClinicalNotes)
                .HasMaxLength(1000)
                .HasColumnName("clinical_notes");
            entity.Property(e => e.ComponentId).HasColumnName("component_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.DeliveryAddressId).HasColumnName("delivery_address_id");
            entity.Property(e => e.NeedBeforeUtc).HasColumnName("need_before_utc");
            entity.Property(e => e.QuantityUnits).HasColumnName("quantity_units");
            entity.Property(e => e.RequesterUserId).HasColumnName("requester_user_id");
            entity.Property(e => e.Status)
                .HasMaxLength(40)
                .HasDefaultValue("REQUESTED")
                .HasColumnName("status");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.Urgency)
                .HasMaxLength(20)
                .HasDefaultValue("NORMAL")
                .HasColumnName("urgency");

            entity.HasOne(d => d.BloodType).WithMany(p => p.Requests)
                .HasForeignKey(d => d.BloodTypeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__requests__blood___09A971A2");

            entity.HasOne(d => d.Component).WithMany(p => p.Requests)
                .HasForeignKey(d => d.ComponentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__requests__compon__0A9D95DB");

            entity.HasOne(d => d.DeliveryAddress).WithMany(p => p.Requests)
                .HasForeignKey(d => d.DeliveryAddressId)
                .HasConstraintName("FK__requests__delive__0B91BA14");

            entity.HasOne(d => d.RequesterUser).WithMany(p => p.Requests)
                .HasForeignKey(d => d.RequesterUserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__requests__reques__08B54D69");
        });

        modelBuilder.Entity<RequestEvent>(entity =>
        {
            entity.HasKey(e => e.EventId).HasName("PK__request___2370F7272927208A");

            entity.ToTable("request_events");

            entity.HasIndex(e => new { e.RequestId, e.CreatedAt }, "IX_request_events_req");

            entity.Property(e => e.EventId).HasColumnName("event_id");
            entity.Property(e => e.ChangedBy).HasColumnName("changed_by");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.DetailsJson).HasColumnName("details_json");
            entity.Property(e => e.EventCode)
                .HasMaxLength(50)
                .HasColumnName("event_code");
            entity.Property(e => e.Reason)
                .HasMaxLength(500)
                .HasColumnName("reason");
            entity.Property(e => e.RequestId).HasColumnName("request_id");

            entity.HasOne(d => d.ChangedByNavigation).WithMany(p => p.RequestEvents)
                .HasForeignKey(d => d.ChangedBy)
                .HasConstraintName("FK__request_e__chang__10566F31");

            entity.HasOne(d => d.Request).WithMany(p => p.RequestEvents)
                .HasForeignKey(d => d.RequestId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__request_e__reque__0F624AF8");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__roles__760965CC51FBE0C7");

            entity.ToTable("roles");

            entity.HasIndex(e => e.RoleCode, "UQ__roles__BAE630757364429A").IsUnique();

            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.Description)
                .HasMaxLength(500)
                .HasColumnName("description");
            entity.Property(e => e.RoleCode)
                .HasMaxLength(50)
                .HasColumnName("role_code");
            entity.Property(e => e.RoleName)
                .HasMaxLength(100)
                .HasColumnName("role_name");
        });

        modelBuilder.Entity<S3Attachment>(entity =>
        {
            entity.HasKey(e => e.AttachmentId).HasName("PK__s3_attac__B74DF4E21B3C017B");

            entity.ToTable("s3_attachments");

            entity.HasIndex(e => new { e.EntityType, e.EntityId }, "IX_attachments_entity");

            entity.Property(e => e.AttachmentId).HasColumnName("attachment_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.EntityId).HasColumnName("entity_id");
            entity.Property(e => e.EntityType)
                .HasMaxLength(50)
                .HasColumnName("entity_type");
            entity.Property(e => e.FileName)
                .HasMaxLength(255)
                .HasColumnName("file_name");
            entity.Property(e => e.FileSize).HasColumnName("file_size");
            entity.Property(e => e.MimeType)
                .HasMaxLength(100)
                .HasColumnName("mime_type");
            entity.Property(e => e.S3Bucket)
                .HasMaxLength(255)
                .HasColumnName("s3_bucket");
            entity.Property(e => e.S3Key)
                .HasMaxLength(500)
                .HasColumnName("s3_key");
            entity.Property(e => e.UploadedBy).HasColumnName("uploaded_by");

            entity.HasOne(d => d.UploadedByNavigation).WithMany(p => p.S3Attachments)
                .HasForeignKey(d => d.UploadedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__s3_attach__uploa__4E53A1AA");
        });

        modelBuilder.Entity<SlaConfig>(entity =>
        {
            entity.HasKey(e => e.SlaId).HasName("PK__sla_conf__F25460DECF4EB245");

            entity.ToTable("sla_config");

            entity.HasIndex(e => e.Urgency, "UQ__sla_conf__A638A78D72555DC2").IsUnique();

            entity.Property(e => e.SlaId).HasColumnName("sla_id");
            entity.Property(e => e.AlertBeforeMinutes).HasColumnName("alert_before_minutes");
            entity.Property(e => e.TargetMinutes).HasColumnName("target_minutes");
            entity.Property(e => e.Urgency)
                .HasMaxLength(20)
                .HasColumnName("urgency");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__users__B9BE370FBE3DC8B3");

            entity.ToTable("users");

            entity.HasIndex(e => e.CognitoUserId, "IX_users_cognito_id")
                .IsUnique()
                .HasFilter("([cognito_user_id] IS NOT NULL)");

            entity.HasIndex(e => e.Email, "UQ__users__AB6E61649E0453D7").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.CognitoUserId)
                .HasMaxLength(100)
                .HasColumnName("cognito_user_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(256)
                .HasColumnName("password_hash");
            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(30)
                .HasColumnName("phone_number");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasMany(d => d.Roles).WithMany(p => p.Users)
                .UsingEntity<Dictionary<string, object>>(
                    "UserRole",
                    r => r.HasOne<Role>().WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__user_role__role___52593CB8"),
                    l => l.HasOne<User>().WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__user_role__user___5165187F"),
                    j =>
                    {
                        j.HasKey("UserId", "RoleId").HasName("PK__user_rol__6EDEA1539264D15B");
                        j.ToTable("user_roles");
                        j.IndexerProperty<long>("UserId").HasColumnName("user_id");
                        j.IndexerProperty<int>("RoleId").HasColumnName("role_id");
                    });
        });

        modelBuilder.Entity<UserProfile>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__user_pro__B9BE370F8927CA86");

            entity.ToTable("user_profiles");

            entity.Property(e => e.UserId)
                .ValueGeneratedNever()
                .HasColumnName("user_id");
            entity.Property(e => e.BirthYear).HasColumnName("birth_year");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.FullName)
                .HasMaxLength(200)
                .HasColumnName("full_name");
            entity.Property(e => e.Gender)
                .HasMaxLength(20)
                .HasColumnName("gender");
            entity.Property(e => e.PrivacyPhoneVisibleToStaffOnly)
                .HasDefaultValue(true)
                .HasColumnName("privacy_phone_visible_to_staff_only");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasOne(d => d.User).WithOne(p => p.UserProfile)
                .HasForeignKey<UserProfile>(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__user_prof__user___571DF1D5");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
