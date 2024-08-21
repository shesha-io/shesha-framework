using Microsoft.AspNetCore.Http;
using Shesha.ConfigurationItems;
using System;

namespace Shesha.Services.Urls
{
    public interface ILinkGeneratorContext
    {
        public LinkGeneratorState State { get; }

        /// <summary>
        /// Begin scope
        /// </summary>
        IDisposable BeginScope(LinkGeneratorState state);
    }
}
