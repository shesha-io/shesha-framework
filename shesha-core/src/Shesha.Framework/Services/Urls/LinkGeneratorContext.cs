using Abp.Dependency;
using Abp.Runtime;
using Microsoft.AspNetCore.Http;
using Shesha.ConfigurationItems;
using System;

namespace Shesha.Services.Urls
{
    public class LinkGeneratorContext : ILinkGeneratorContext, ITransientDependency
    {
        private const string ScopeKey = "sha-link-generator";
        private readonly IAmbientScopeProvider<LinkGeneratorState> _scopeProvider;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public LinkGeneratorContext(IAmbientScopeProvider<LinkGeneratorState> scopeProvider, IHttpContextAccessor httpContextAccessor)
        {
            _scopeProvider = scopeProvider;
            _httpContextAccessor = httpContextAccessor;
        }

        private LinkGeneratorState _defaultState;

        private LinkGeneratorState GetDefaultState() 
        {
            var request = _httpContextAccessor.HttpContext?.Request;
            return request != null
                ? new LinkGeneratorState(request) 
                : null;
        }

        public LinkGeneratorState State
        {
            get
            {
                return _scopeProvider.GetValue(ScopeKey) ?? _defaultState ?? (_defaultState = GetDefaultState());
            }
        }

        public IDisposable BeginScope(LinkGeneratorState state)
        {
            return _scopeProvider.BeginScope(ScopeKey, state);
        }
    }
}
