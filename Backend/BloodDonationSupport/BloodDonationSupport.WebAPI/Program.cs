using BloodDonationSupport.Application;
using BloodDonationSupport.Infrastructure;
using BloodDonationSupport.WebAPI.Middlewares;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

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
builder.Services.AddSwaggerGen();
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
            ValidateIssuerSigningKey = true
        };
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