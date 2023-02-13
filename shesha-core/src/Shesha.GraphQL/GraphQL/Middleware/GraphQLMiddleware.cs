using GraphQL;
using GraphQL.Instrumentation;
using GraphQL.Transport;
using Microsoft.AspNetCore.Http;
using Shesha.GraphQL.Provider;
using Shesha.Utilities;
using System;
using System.Net;
using System.Threading.Tasks;

namespace Shesha.GraphQL.Middleware
{
    public class GraphQLMiddleware : IMiddleware
    {
        private readonly GraphQLSettings _settings;
        private readonly IDocumentExecuter _executer;
        private readonly IGraphQLSerializer _serializer;
        private readonly ISchemaContainer _schemaContainer;

        public GraphQLMiddleware(
            GraphQLSettings settings,
            IDocumentExecuter executer,
            IGraphQLSerializer serializer,
            IGraphQLQueryProvider queryProvider,
            ISchemaContainer schemaContainer)
        {
            _settings = settings;
            _executer = executer;
            _serializer = serializer;
            _schemaContainer = schemaContainer;
        }

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            if (!IsGraphQLRequest(context, out var schemaName))
            {
                await next(context);
                return;
            }

            await ExecuteAsync(context, schemaName);
        }

        private bool IsGraphQLRequest(HttpContext context, out string schemaName)
        {
            if (context.Request.Path.StartsWithSegments(_settings.Path) && string.Equals(context.Request.Method, "POST", StringComparison.OrdinalIgnoreCase)) 
            {
                schemaName = context.Request.Path.HasValue
                    ? context.Request.Path.Value.RemovePrefix(_settings.Path).Trim('/')
                    : null;
                return true;
            }
            schemaName = null;
            return false;
        }

        private async Task ExecuteAsync(HttpContext context, string schemaName = null)
        {
            var request = await _serializer.ReadAsync<GraphQLRequest>(context.Request.Body, context.RequestAborted);

            var start = DateTime.UtcNow;

            var schema = await _schemaContainer.GetOrDefaultAsync(schemaName);

            var result = await _executer.ExecuteAsync(_ =>
            {
                _.Schema = schema;
                _.Query = request?.Query;
                _.OperationName = request?.OperationName;
                _.Variables = request?.Variables;
                _.UserContext = _settings.BuildUserContext?.Invoke(context);
                _.EnableMetrics = _settings.EnableMetrics;
                _.RequestServices = context.RequestServices;
                _.CancellationToken = context.RequestAborted;
            });

            if (_settings.EnableMetrics)
            {
                result.EnrichWithApolloTracing(start);
            }

            await WriteResponseAsync(context, result);
        }

        private async Task WriteResponseAsync(HttpContext context, ExecutionResult result)
        {
            context.Response.ContentType = "application/graphql+json";
            context.Response.StatusCode = result.Executed ? (int)HttpStatusCode.OK : (int)HttpStatusCode.BadRequest;

            await _serializer.WriteAsync(context.Response.Body, result, context.RequestAborted);
        }
    }

}
