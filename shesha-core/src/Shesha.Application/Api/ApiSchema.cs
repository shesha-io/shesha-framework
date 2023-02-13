using GraphQL;
using GraphQL.Types;
using Shesha.Api.Dto;
using Shesha.GraphQL.Provider;
using Shesha.GraphQL.Provider.GraphTypes;
using System;

namespace Shesha.Api
{
    /// <summary>
    /// API schema
    /// </summary>
    public class ApiSchema: Schema 
    {
        public ApiSchema(IServiceProvider serviceProvider) : base(serviceProvider)
        {
            Query = new ApiQuery(serviceProvider);

            this.RegisterTypeMapping<ApiEndpointInfo, GraphQLGenericType<ApiEndpointInfo>>();
            this.RegisterTypeMapping<PagedResultDtoType<ApiEndpointInfo>, GraphQLGenericType<PagedResultDtoType<ApiEndpointInfo>>>();

            this.NameConverter = ShaCamelCaseNameConverter.Instance;
        }
    }
}
