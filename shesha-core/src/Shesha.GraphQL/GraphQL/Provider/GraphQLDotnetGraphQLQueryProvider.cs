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
            // change input type to GraphQLRequest

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

            /*
            using var memoryStream = new MemoryStream();

            await _writer.WriteAsync(memoryStream, result);

            memoryStream.Seek(0, SeekOrigin.Begin);

            var response = await JsonSerializer.DeserializeAsync<Dictionary<string, object>>(memoryStream);
            return response;
            */
        }
        /*
    protected virtual Task WriteResponseAsync<TResult>(HttpResponse httpResponse, IGraphQLSerializer serializer, CancellationToken cancellationToken, TResult result)
    {
        httpResponse.ContentType = "application/json";
        httpResponse.StatusCode = result is not ExecutionResult executionResult || executionResult.Executed ? 200 : 400; // BadRequest when fails validation; OK otherwise

        return serializer.WriteAsync(httpResponse.Body, result, cancellationToken);
    }         
         */

        /*
    protected virtual Task<ExecutionResult> ExecuteRequestAsync(
        GraphQLRequest gqlRequest,
        IDictionary<string, object> userContext,
        IDocumentExecuter<TSchema> executer,
        IServiceProvider requestServices,
        CancellationToken token)
        => executer.ExecuteAsync(new ExecutionOptions
        {
            Query = gqlRequest.Query,
            OperationName = gqlRequest.OperationName,
            Variables = gqlRequest.Variables,
            Extensions = gqlRequest.Extensions,
            UserContext = userContext,
            RequestServices = requestServices,
            CancellationToken = token
        });         
         */
    }
}
