using System.ComponentModel.DataAnnotations;
using MediatR;
using Shared.Messaging.Messaging;

namespace Shared.Application.Validation;

public sealed class DataAnnotationsValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var validationContext = new ValidationContext(request);
        var validationResults = new List<ValidationResult>();
        var isValid = Validator.TryValidateObject(request, validationContext, validationResults, true);

        if (isValid) return await next();

        var errors = validationResults
            .SelectMany(result =>
            {
                var members = result.MemberNames.Any()
                    ? result.MemberNames
                    : [string.Empty];
                return members.Select(member => new { Member = member, Error = result.ErrorMessage ?? "Validation failed." });
            })
            .GroupBy(item => item.Member)
            .ToDictionary(
                group => group.Key,
                group => group.Select(item => item.Error).Distinct().ToArray());

        throw new RequestValidationException(errors);
    }
}
