using Amazon.LocationService;
using BloodDonationSupport.Application.Common.Interfaces;
using BloodDonationSupport.Infrastructure.Common.Options;
using BloodDonationSupport.Infrastructure.Identity;
using BloodDonationSupport.Infrastructure.Persistence.Contexts;
using BloodDonationSupport.Infrastructure.Persistence.Repositories;
using BloodDonationSupport.Infrastructure.Persistence.UnitOfWork;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BloodDonationSupport.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
        {
            //  Connect SQL Server
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(
                    config.GetConnectionString("DBDefault"),
                    sql =>
                    {
                        sql.EnableRetryOnFailure(
                            maxRetryCount: 5,
                            maxRetryDelay: TimeSpan.FromSeconds(10),
                            errorNumbersToAdd: null);
                        sql.CommandTimeout(60); // optional: extend timeout
                    }));

            // Register Repositories
            services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IUserProfileRepository, UserProfileRepository>();
            services.AddScoped<IRoleRepository, RoleRepository>();
            services.AddScoped<IAuditLogRepository, AuditLogRepository>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IAuditService, AuditService>();
            services.AddScoped<IPostRepository, PostRepository>();
            services.AddScoped<IPostTagRepository, PostTagRepository>();
            services.AddScoped<IDonorRepository, DonorRepository>();
            services.AddScoped<IAddressRepository, AddressRepository>();
            services.AddScoped<ILocationService, LocationService>();
            services.AddScoped<IRequestRepository, RequestRepository>();
            services.AddScoped<ICurrentUserService, CurrentUserService>();
            services.AddScoped<IAwsRouteCalculator, AwsRouteCalculator>();
            services.AddScoped<ICompatibilityRepository, CompatibilityRepository>();
            services.AddAWSService<IAmazonLocationService>();
            // HttpContext accessor (lifetime managed by framework)
            services.AddHttpContextAccessor();

            //  AWS Options
            services.Configure<AwsOptions>(config.GetSection("AWS"));

            // Cognito Authentication
            services.AddScoped<ICognitoService, CognitoService>();

            return services;
        }
    }
}