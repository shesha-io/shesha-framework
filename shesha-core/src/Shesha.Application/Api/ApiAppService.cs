using Abp.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.ActionConstraints;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.Extensions.Hosting.Internal;
using Shesha.Api.Dto;
using Shesha.AutoMapper.Dto;
using Shesha.Permissions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Api
{
    /// <summary>
    /// API application service
    /// </summary>
    public class ApiAppService : SheshaAppServiceBase//, IApiAppService
    {
        private readonly IApiDescriptionGroupCollectionProvider _apiDescriptionsProvider;
        private readonly IPermissionedObjectManager _permissionedObjectManager;

        private readonly IApplicationLifetime _applicationLifetime;

        public ApiAppService(
            IApiDescriptionGroupCollectionProvider apiDescriptionsProvider,
            IPermissionedObjectManager permissionedObjectManager,
            IApplicationLifetime applicationLifetime
        )
        {
            _apiDescriptionsProvider = apiDescriptionsProvider;
            _permissionedObjectManager = permissionedObjectManager;
            _applicationLifetime = applicationLifetime;
        }

        [HttpGet]
        public async Task<List<AutocompleteItemDto>> EndpointsAsync(string? term, string? verb, int maxResultCount = 10)
        {
            var actionDescriptors = _apiDescriptionsProvider.ApiDescriptionGroups.Items.SelectMany(g => g.Items.Select(gi => gi.ActionDescriptor)).ToList();

            // ToDo: AS - make endpoints list cachable

            var permissioned = new List<ActionDescriptor>();
            foreach (var actionDescriptor in actionDescriptors)
                if (await _permissionedObjectManager.IsActionDescriptorEnabledAsync(actionDescriptor))
                    permissioned.Add(actionDescriptor);

            var allEndpoints = permissioned.SelectMany(desc =>
            {
                var verbs = desc.ActionConstraints?.OfType<HttpMethodActionConstraint>().SelectMany(c => c.HttpMethods).Distinct().ToList() ?? new List<string> { "" };

                return desc is ControllerActionDescriptor actionDescriptor
                    ? verbs.Select(v => new ApiEndpointInfo
                        {
                            HttpVerb = v.ToLower(),
                            Url = "/" + desc.AttributeRouteInfo?.Template?.TrimStart('/'),

                            ActionName = actionDescriptor.ActionName,
                            ControllerName = actionDescriptor.ControllerName,
                        })
                    : new List<ApiEndpointInfo>();
            })
                .Where(i => !string.IsNullOrWhiteSpace(i.Url))
                .ToList();

            var endpoints = allEndpoints.Where(ep => (string.IsNullOrWhiteSpace(verb) || ep.HttpVerb == verb.ToLower()) && (string.IsNullOrWhiteSpace(term) || ep.Url.Contains(term, StringComparison.InvariantCultureIgnoreCase)))
                .OrderBy(ep => ep.Url)
                .Select(ep => new AutocompleteItemDto { Value = ep.Url, DisplayText = ep.Url })
                .Take(maxResultCount)
                .ToList();

            return endpoints;
        }

        [HttpGet]
        public async Task<string> ShutdownAsync()
        {
            _applicationLifetime. StopApplication();
            return await Task.FromResult("Done");
        }
    }
}
