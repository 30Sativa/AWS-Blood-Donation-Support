using BloodDonationSupport.Application;
using BloodDonationSupport.Infrastructure;
using BloodDonationSupport.WebAPI.Middlewares;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// =========================================================
// 🔧 CONFIGURATION
// =========================================================
builder.Configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddEnvironmentVariables();

var config = builder.Configuration;

// =========================================================
// 🧩 SERVICES REGISTRATION
// =========================================================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "BloodDonationSupport.WebAPI",
        Version = "1.0",
        Description = "Blood Donation Support System API"
    });

    // Thêm JWT Bearer authentication vào Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.\n\nExample: \"Bearer 12345abcdef\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});
builder.Services.AddHttpContextAccessor();

builder.Services.AddApplication();
builder.Configuration.AddEnvironmentVariables();
builder.Services.AddInfrastructure(config);

// =========================================================
// 🌐 CORS CONFIGURATION (Frontend local React dev)
// =========================================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173") // React frontend local
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// =========================================================
// 🔐 JWT AUTHENTICATION (AWS Cognito)
// =========================================================
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var region = "ap-southeast-2";
        var poolId = config["AWS:Cognito:UserPoolId"];

        options.Authority = $"https://cognito-idp.{region}.amazonaws.com/{poolId}";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            RoleClaimType = "cognito:groups" // AWS Cognito groups = roles
        };
    });

// =========================================================
// 🛡️ AUTHORIZATION POLICIES
// =========================================================
builder.Services.AddAuthorization(options =>
{
    // Admin có quyền làm mọi thứ user làm được
    options.AddPolicy("AdminOrUser", policy =>
        policy.RequireAssertion(context =>
            context.User.IsInRole("ADMIN") || 
            context.User.IsInRole("MEMBER") || 
            context.User.IsInRole("STAFF")));

    // Chỉ Admin
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireRole("ADMIN"));

    // Admin hoặc Staff
    options.AddPolicy("AdminOrStaff", policy =>
        policy.RequireAssertion(context =>
            context.User.IsInRole("ADMIN") || 
            context.User.IsInRole("STAFF")));

    // User (Member) hoặc Admin
    options.AddPolicy("UserOrAdmin", policy =>
        policy.RequireAssertion(context =>
            context.User.IsInRole("MEMBER") || 
            context.User.IsInRole("ADMIN")));
});

// =========================================================
// ⚙️ WEB HOST CONFIG
// =========================================================
builder.WebHost.UseUrls("http://0.0.0.0:5000");

var app = builder.Build();

// =========================================================
// ⚡️ MIDDLEWARE PIPELINE
// =========================================================
app.UseMiddleware<GlobalExceptionMiddleware>();

// ✅ Swagger
var enableSwagger = config.GetValue<bool>("EnableSwagger");
Console.WriteLine($"EnableSwagger = {enableSwagger}");

if (app.Environment.IsDevelopment() || enableSwagger)
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ✅ HTTPS redirection
app.UseHttpsRedirection();

// ✅ CORS
app.UseCors("AllowLocalFrontend");

// ✅ Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// ✅ Controllers
app.MapControllers();

// =========================================================
// 🚀 RUN APPLICATION
// =========================================================
app.Run();