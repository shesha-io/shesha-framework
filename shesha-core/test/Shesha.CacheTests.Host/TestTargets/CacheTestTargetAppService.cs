using Abp.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Shesha.CacheTests.Host.TestTargets
{
    /// <summary>
    /// A no-op endpoint that exists only to be a permissioned object the coherence suite can flip
    /// access on.
    ///
    /// The permission tests change an endpoint's access level and assert the change reaches the
    /// other instances. Doing that to a real framework service risks locking something out if a
    /// restore fails, and doing it to another application's service is what coupled this project to
    /// that application. This one is inert, so mutating it costs nothing.
    /// </summary>
    public class CacheTestTargetAppService : ApplicationService
    {
        /// <summary>Does nothing. Present so the endpoint exists and gets a permissioned object.</summary>
        [HttpGet]
        public string Ping() => "pong";
    }
}
