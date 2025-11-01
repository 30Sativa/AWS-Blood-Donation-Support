using FluentValidation;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Text.Json;

namespace BloodDonationSupport.WebAPI.Middlewares
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);

                //  Nếu ASP.NET ModelState invalid mà không bị FluentValidation bắt
                if (context.Response.StatusCode == (int)HttpStatusCode.BadRequest &&
                    !context.Response.HasStarted &&
                    context.Features.Get<IHttpResponseFeature>()?.ReasonPhrase == "ModelState invalid")
                {
                    await WriteErrorResponseAsync(context, HttpStatusCode.BadRequest, "Invalid request data");
                }
            }
            catch (ValidationException vex)
            {
                _logger.LogWarning("⚠️ Validation failed: {Errors}", JsonSerializer.Serialize(vex.Errors));

                var errors = vex.Errors.Select(e => new
                {
                    field = CleanFieldName(e.PropertyName),
                    error = e.ErrorMessage
                });

                await WriteErrorResponseAsync(context, HttpStatusCode.BadRequest, "Validation failed", errors);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Unhandled exception");

                await WriteErrorResponseAsync(context, HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        //Chuẩn hóa tên field (loại bỏ prefix như request. hay command.)
        private static string CleanFieldName(string? name)
        {
            if (string.IsNullOrEmpty(name))
                return string.Empty;

            var parts = name.Split('.', StringSplitOptions.RemoveEmptyEntries);
            return parts.Last();
        }

        // Hàm chung để ghi JSON response đẹp và thống nhất
        private static async Task WriteErrorResponseAsync(
            HttpContext context,
            HttpStatusCode statusCode,
            string message,
            object? errors = null)
        {
            context.Response.StatusCode = (int)statusCode;
            context.Response.ContentType = "application/json";

            var response = new
            {
                success = false,
                message,
                errors,
                traceId = context.TraceIdentifier,
                timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
            };

            var options = new JsonSerializerOptions
            {
                WriteIndented = true // cho đẹp khi debug qua Swagger
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
        }
    }
}
