using Abp.Domain.Entities;
using Shesha.Application.Services.Dto;
using Shesha.GraphQL.Mvc;
using System;
using System.Threading.Tasks;

namespace Shesha.GraphQL.Helpers
{
    /// <summary>
    /// GraphQL query executer. Implements base queries to entities
    /// </summary>
    public interface IGraphQLQueryExecuter
    {
        Task<GraphQLDataResult<TEntity>> QueryAsync<TEntity, TPrimaryKey>(GetDynamicEntityInput<TPrimaryKey> input) where TEntity: IEntity<TPrimaryKey>;

        Task<GraphQLDataResult> QueryAsync<TPrimaryKey>(Type entityType, GetDynamicEntityInput<TPrimaryKey> input);
    }
}
