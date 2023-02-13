using GraphQL;
using JetBrains.Annotations;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.GraphQL.Provider
{
    public interface IGraphQLQueryProvider
    {
        /// <summary>
        /// Execute the GraphQL query.
        /// </summary>
        /// <param name="operationName">Operation name to execute. For example: Book.</param>
        /// <param name="query">The query string. For example: query Book { book { name } }.</param>
        /// <param name="variables">Variables dictionary. For example: new({ {"filter", "Adult"} }).</param>
        /// <param name="defaultSchemaName">Used to get a schema if the operation name was not specified.</param>
        /// <returns>A dictionary result.</returns>
        Task<ExecutionResult> ExecuteAsync(
            [CanBeNull] string operationName,
            [NotNull] string query,
            [CanBeNull] Dictionary<string, object> variables,
            [CanBeNull] string defaultSchemaName = null);
    }
}
