using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Shared.Api.Filters;

public sealed class ModelStateProblemDetailsFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (context.ModelState.IsValid)
        {
            await next();
            return;
        }

        var errors = context.ModelState
            .Where(item => item.Value?.Errors.Count > 0)
            .ToDictionary(
                item => item.Key,
                item => item.Value!.Errors
                    .Select(error => string.IsNullOrWhiteSpace(error.ErrorMessage)
                        ? "Validation failed."
                        : error.ErrorMessage)
                    .ToArray());

        var problem = new ProblemDetails
        {
            Type = "https://httpstatuses.com/400",
            Title = "Bad Request",
            Status = StatusCodes.Status400BadRequest,
            Detail = "Request validation failed.",
            Instance = context.HttpContext.Request.Path
        };

        problem.Extensions["errors"] = errors;
        problem.Extensions["traceId"] = Activity.Current?.Id ?? context.HttpContext.TraceIdentifier;

        context.Result = new ObjectResult(problem)
        {
            StatusCode = StatusCodes.Status400BadRequest,
            ContentTypes = { "application/problem+json" }
        };
    }
}
