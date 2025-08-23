using Shared.Api.Commands;
using Shared.Api.Query;
using Shared.Dtos;

namespace Shared.Api.Services;

public interface IService<in TCreateCommand, in TUpdateCommand, in TDeleteCommand, in TQuery,
    TDto>
    where TCreateCommand : CreateCommand<ResultContainer<TDto>>
    where TUpdateCommand : UpdateCommand<ResultContainer<TDto>>
    where TDeleteCommand : DeleteCommand<ResultContainer<TDto>>
    where TQuery : Query<ResultContainer<TDto>>
    where TDto : Dto
{
    Task<ResultContainer<TDto>> CreateAsync(TCreateCommand command);
    Task<ResultContainer<TDto>> UpdateAsync(TUpdateCommand command);
    Task<ResultContainer<TDto>> DeleteAsync(TDeleteCommand command);
    Task<ResultContainer<TDto>> GetAsync(TQuery query);
}