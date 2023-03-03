using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ActionConstraints;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.AspNetCore.Mvc.Controllers;
using Shesha.Api.Dto;
using Shesha.AutoMapper.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Api
{
    /// <summary>
    /// API application service
    /// </summary>
    public class ApiAppService: SheshaAppServiceBase//, IApiAppService
    {
        private readonly IApiDescriptionGroupCollectionProvider _apiDescriptionsProvider;
        public ApiAppService(IApiDescriptionGroupCollectionProvider apiDescriptionsProvider)
        {
            _apiDescriptionsProvider = apiDescriptionsProvider;
        }

        [HttpGet]
        public Task<List<AutocompleteItemDto>> EndpointsAsync(string term, string verb, int maxResultCount = 10)
        {
            var actionDescriptors = _apiDescriptionsProvider.ApiDescriptionGroups.Items.SelectMany(g => g.Items.Select(gi => gi.ActionDescriptor)).ToList();

            var allEndpoints = actionDescriptors.SelectMany(desc => {
                var verbs = desc.ActionConstraints.OfType<HttpMethodActionConstraint>().SelectMany(c => c.HttpMethods).Distinct().ToList();

                var actionDescriptor = desc as ControllerActionDescriptor;

                return verbs.Select(v => new ApiEndpointInfo { 
                    HttpVerb = v.ToLower(),
                    Url = "/" + desc.AttributeRouteInfo?.Template.TrimStart('/'),
                    
                    ActionName = actionDescriptor?.ActionName,
                    ControllerName = actionDescriptor?.ControllerName,
                });
            })
                .Where(i => !string.IsNullOrWhiteSpace(i.Url))
                .ToList();

            var endpoints = allEndpoints.Where(ep => (string.IsNullOrWhiteSpace(verb) || ep.HttpVerb == verb.ToLower()) && (string.IsNullOrWhiteSpace(term) || ep.Url.Contains(term, StringComparison.InvariantCultureIgnoreCase)))
                .OrderBy(ep => ep.Url)
                .Select(ep => new AutocompleteItemDto { Value = ep.Url, DisplayText = ep.Url })
                .Take(maxResultCount)
                .ToList();

            return Task.FromResult(endpoints);
        }
    }
}
