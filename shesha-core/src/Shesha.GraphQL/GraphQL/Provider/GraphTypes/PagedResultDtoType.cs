using Abp.Application.Services.Dto;
using GraphQL;
using GraphQL.Types;
using System;

namespace Shesha.GraphQL.Provider.GraphTypes
{
    public class PagedResultDtoType<T> : ObjectGraphType<PagedResultDto<T>>
    {
        public PagedResultDtoType()
        {
            Name = MakeName();

            Field(x => x.TotalCount);
            Field(x => x.Items);
        }

        private static string MakeName()
        {
            var genericTypeName = GraphTypeMapper.BuiltInScalarMappings.ContainsKey(typeof(T))
                ? ((IGraphType)Activator.CreateInstance(GraphTypeMapper.BuiltInScalarMappings[typeof(T)])).Name
                : typeof(T).GetNamedType().Name;

            return $"PagedResultDto_{genericTypeName}";
        }
    }
}
