using GraphQL;
using GraphQL.Execution;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Shesha.Application.Services.Dto;
using Shesha.GraphQL.NewtonsoftJson;
using System;

namespace Shesha.GraphQL.Mvc
{
    /// <summary>
    /// GraphQL data result
    /// </summary>
    public class GraphQLDataResult : JsonResult, IDynamicDataResult
    {
        private static JsonSerializerSettings MakeSerializerSettings() 
        {
            var errorInfoProvider = new ErrorInfoProvider();
            return new JsonSerializerSettings
            {
                Formatting = Formatting.Indented,
                ContractResolver = new ShaGraphQLContractResolver(errorInfoProvider)
                {
                    NamingStrategy = new CamelCaseNamingStrategy
                    {
                        ProcessDictionaryKeys = true,
                        OverrideSpecifiedNames = true
                    }
                },
            };
        }

        private Lazy<JsonSerializerSettings> LazySerializerSettings = new Lazy<JsonSerializerSettings>(MakeSerializerSettings);

        public GraphQLDataResult(ExecutionResult executionResult) : base(executionResult)
        {
            SerializerSettings = LazySerializerSettings.Value;
        }
    }

    public class GraphQLDataResult<TDecorator> : GraphQLDataResult
    {
        public GraphQLDataResult(ExecutionResult executionResult) : base(executionResult)
        {
        }
    }
}
