using BloodDonationSupport.Application.Common.Behaviors;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using FluentValidation;

namespace BloodDonationSupport.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            //Đăng ký MediatR (quét toàn bộ Application assembly)
            services.AddMediatR(cfg =>
            {
                cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
            });

            //Đăng ký FluentValidation (tự động tìm tất cả validator)
            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

            //  Đăng ký Pipeline Behaviors (theo thứ tự chạy)
            // ValidationBehavior chạy trước TransactionBehavior
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(TransactionBehavior<,>));

            return services;
        }
    }
}
