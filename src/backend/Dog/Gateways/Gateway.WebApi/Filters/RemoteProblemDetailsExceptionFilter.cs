using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Shared.Messaging.Messaging;

namespace Gateway.Api.Filters;

/// <summary>
/// Converts RemoteProblemDetailsException to RFC7807 HTTP response for all MVC controllers.
/// </summary>
public sealed class RemoteProblemDetailsExceptionFilter : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        if (context.Exception is not RemoteProblemDetailsException e) return;

        context.Result = new ObjectResult(e.Problem)
        {
            StatusCode = e.Problem.Status ?? StatusCodes.Status500InternalServerError,
            ContentTypes = { "application/problem+json" }
        };

        context.ExceptionHandled = true;
    }
}

