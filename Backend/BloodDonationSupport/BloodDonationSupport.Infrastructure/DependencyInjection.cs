using Amazon.LocationService;
using Amazon.SimpleNotificationService;
using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Infrastructure.Common.Options;
using BloodDonationSupport.Infrastructure.Identity;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using BloodDonationSupport.Infrastructure.Persistence.Repositories;
using BloodDonationSupport.Infrastructure.Persistence.UnitOfWork;
using BloodDonationSupport.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BloodDonationSupport.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
        {
            // ============================
            // DATABASE
            // ============================
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(
                        config.GetConnectionString("DBDefault"),
                        sql =>
                        {
                            sql.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null);
                            sql.CommandTimeout(60);
                        })
                    .EnableSensitiveDataLogging()
                    .EnableDetailedErrors()
                    .LogTo(Console.WriteLine, Microsoft.Extensions.Logging.LogLevel.Information)
            );

            // ============================
            // REPOSITORIES
            // ============================
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IUserProfileRepository, UserProfileRepository>();
            services.AddScoped<IRoleRepository, RoleRepository>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IPostRepository, PostRepository>();
            services.AddScoped<IPostTagRepository, PostTagRepository>();
            services.AddScoped<IDonorRepository, DonorRepository>();
            services.AddScoped<IAddressRepository, AddressRepository>();
            services.AddScoped<IBloodTypeRepository, BloodTypeRepository>();
            services.AddScoped<IHealthConditionRepository, HealthConditionRepository>();
            services.AddScoped<IMatchRepository, MatchRepository>();
            services.AddScoped<IAppointmentRepository, AppointmentRepository>();
            services.AddScoped<ILocationService, LocationService>();
            services.AddScoped<IRequestRepository, RequestRepository>();
            services.AddScoped<ICurrentUserService, CurrentUserService>();
            services.AddScoped<IAwsRouteCalculator, AwsRouteCalculator>();
            services.AddScoped<ICompatibilityRepository, CompatibilityRepository>();
            services.AddAWSService<IAmazonLocationService>();

            services.AddSingleton<IDateTimeProvider, DateTimeProvider>();

            // ============================
            // AWS SNS CLIENT
            // ============================
            services.AddSingleton<IAmazonSimpleNotificationService>(sp =>
            {
                var region = config["AWS:Region"];
                return new AmazonSimpleNotificationServiceClient(
                    Amazon.RegionEndpoint.GetBySystemName(region)
                );
            });

            // ============================
            // SNS PUBLISHER
            // ============================
            services.AddSingleton<IMatchEventPublisher, AwsMatchEventPublisher>();

            services.AddHttpContextAccessor();

            // ============================
            // AWS OPTIONS BINDING
            // ============================
            services.Configure<AwsOptions>(config.GetSection("AWS"));

            // ============================
            // COGNITO
            // ============================
            services.AddScoped<ICognitoService, CognitoService>();

            return services;
        }
    }
}
