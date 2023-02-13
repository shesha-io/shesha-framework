using Abp.Application.Services.Dto;
using Abp.Dependency;
using GraphQL;
using GraphQL.Types;
using Microsoft.AspNetCore.Mvc.ActionConstraints;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json.Linq;
using Shesha.Api.Dto;
using Shesha.Application.Services.Dto;
using Shesha.GraphQL.Provider.GraphTypes;
using Shesha.JsonLogic;
using Shesha.QuickSearch;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.Api
{
    public class ApiQuery: ObjectGraphType, ITransientDependency
    {
        private readonly IJsonLogic2LinqConverter _jsonLogicConverter;

        public ApiQuery(IServiceProvider serviceProvider) 
        {
            _jsonLogicConverter = serviceProvider.GetRequiredService<IJsonLogic2LinqConverter>();

            FieldAsync<PagedResultDtoType<ApiEndpointInfo>>(
                "endpoints",
                arguments: new QueryArguments(
                    new QueryArgument<GraphQLInputGenericType<FilteredPagedAndSortedResultRequestDto>> { Name = "input", DefaultValue = new FilteredPagedAndSortedResultRequestDto() }
                ),
                resolve: async context => {
                    var input = context.GetArgument<FilteredPagedAndSortedResultRequestDto>("input");

                    var apiDescriptionsProvider = serviceProvider.GetService<IApiDescriptionGroupCollectionProvider>();
                    var quickSearcher = serviceProvider.GetRequiredService<IQuickSearcher>();

                    var actionDescriptors = apiDescriptionsProvider.ApiDescriptionGroups.Items.SelectMany(g => g.Items.Select(gi => gi.ActionDescriptor)).ToList();

                    var allEndpoints = actionDescriptors.SelectMany(desc => {
                        var verbs = desc.ActionConstraints.OfType<HttpMethodActionConstraint>().SelectMany(c => c.HttpMethods).Distinct().ToList();

                        var actionDescriptor = desc as ControllerActionDescriptor;

                        /*
                        if (actionDescriptor != null && actionDescriptor.ActionName.Contains("Query")) 
                        {
                            XmlCommentsNodeNameHelper.GetMemberNameForType();
                        }
                        */

                        return verbs.Select(v => new ApiEndpointInfo
                        {
                            HttpVerb = v,
                            Url = desc.AttributeRouteInfo?.Template,

                            ActionName = actionDescriptor?.ActionName,
                            ControllerName = actionDescriptor?.ControllerName,
                        });
                    })
                        .Where(i => !string.IsNullOrWhiteSpace(i.Url))
                        .AsQueryable();

                    var endpoints = AddFilter(allEndpoints, input.Filter);

                    // add quick search
                    if (!string.IsNullOrWhiteSpace(input.QuickSearch))
                        endpoints = endpoints.Where(ep => ep.Url.Contains(input.QuickSearch, StringComparison.InvariantCultureIgnoreCase) || (ep.Description ?? "").Contains(input.QuickSearch, StringComparison.InvariantCultureIgnoreCase));

                    // apply paging
                    var pageQuery = endpoints.Skip(input.SkipCount);
                    if (input.MaxResultCount > 0)
                        pageQuery = pageQuery.Take(input.MaxResultCount);

                    var result = new PagedResultDto<ApiEndpointInfo>
                    {
                        Items = pageQuery.ToList(),
                        TotalCount = allEndpoints.Count()
                    };

                    return result;
                }
            );
        }

        /// <summary>
        /// Add filter to <paramref name="query"/>
        /// </summary>
        /// <param name="query">Queryable to be filtered</param>
        /// <param name="filter">String representation of JsonLogic filter</param>
        /// <returns></returns>
        private IQueryable<TRow> AddFilter<TRow>(IQueryable<TRow> query, string filter)
        {
            if (string.IsNullOrWhiteSpace(filter))
                return query;

            var jsonLogic = JObject.Parse(filter);

            var expression = _jsonLogicConverter.ParseExpressionOf<TRow>(jsonLogic);

            return expression != null
                ? query.Where(expression)
                : query;
        }
    }
}
