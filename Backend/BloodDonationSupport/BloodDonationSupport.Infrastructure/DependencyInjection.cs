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
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IAuditService, AuditService>();
            //  AWS Options
            services.Configure<AwsOptions>(config.GetSection("AWS"));

            // Cognito Authentication
            services.AddScoped<ICognitoService, CognitoService>();

            return services;
        }
    }
}