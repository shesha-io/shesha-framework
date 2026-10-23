using Abp.Application.Services.Dto;
using GraphQL.Types;

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
            var genericTypeName = GraphTypeMapper.GetTypeName<T>();

            return $"PagedResultDto_{genericTypeName}";
        }
    }
}
