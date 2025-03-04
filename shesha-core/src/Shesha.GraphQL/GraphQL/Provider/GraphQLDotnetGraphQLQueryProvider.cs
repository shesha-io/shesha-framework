using Abp.Dependency;
using GraphQL;
using GraphQL.SystemTextJson;
using GraphQL.Validation.Complexity;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;

namespace Shesha.GraphQL.Provider
{
    public class GraphQLDotnetGraphQLQueryProvider : IGraphQLQueryProvider, ITransientDependency
    {
        private readonly IGraphQLSerializer _writer;
        private readonly IDocumentExecuter _executer;
        private readonly ISchemaContainer _schemaContainer;
        private readonly IServiceProvider _serviceProvider;

        public GraphQLDotnetGraphQLQueryProvider(
            IGraphQLSerializer writer,
            IDocumentExecuter executer,
            ISchemaContainer schemaContainer,
            IServiceProvider serviceProvider)
        {
            _writer = writer;
            _executer = executer;
            _schemaContainer = schemaContainer;
            _serviceProvider = serviceProvider;
        }

        public virtual async Task<ExecutionResult> /*Task<Dictionary<string, object>>*/ ExecuteAsync(string operationName, string query,
            Dictionary<string, object> variables, string defaultSchemaName = null)
        {
            var schema = await _schemaContainer.GetOrDefaultAsync(operationName, defaultSchemaName);

            variables ??= new Dictionary<string, object>();

            foreach (var pair in variables)
            {
                if (pair.Value is JsonElement)
                {
                    variables[pair.Key] = pair.Value;//.ToString().ToInputs();
                }
            }

            var gInputs = new Inputs(variables);

            var queryToExecute = query;

            var result = await _executer.ExecuteAsync(_ =>
            {
                _.Schema = schema;
                _.Query = queryToExecute;
                _.OperationName = operationName;
                _.Variables = gInputs;
#if DEBUG
                _.ThrowOnUnhandledException = true;
#endif
                _.ComplexityConfiguration = new ComplexityConfiguration { MaxDepth = 15 };
                _.RequestServices = _serviceProvider;

            });

            using var memoryStream = new MemoryStream();

            await _writer.WriteAsync(memoryStream, result);

            memoryStream.Seek(0, SeekOrigin.Begin);

            var deserializedResult = await _writer.ReadAsync<ExecutionResult>(memoryStream);
            return deserializedResult;
        }
    }
}
