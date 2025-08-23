using Shared.Api.Commands;

namespace Shared.Api.Query;

public abstract class Query<TResult> : Command<TResult>;