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
            // Connect SQL Server
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(config.GetConnectionString("DBDefault")));

            // Register Repository + UoW
            services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            // ✅ Bind AWS options từ appsettings.json
            services.Configure<AwsOptions>(config.GetSection("AWS"));

            // ✅ AWS Cognito
            services.AddScoped<ICognitoService, CognitoService>();

            return services;
        }
    }
}
