using Microsoft.Extensions.Configuration;
using Shesha.Authorization.Users;
using Shesha.Services;
using System.Threading.Tasks;

namespace Shesha
{
    /// <summary>
    /// Empty implementation of the <see cref="IHomePageRouter"/>
    /// </summary>
    public class NullHomePageRouter : IHomePageRouter
    {
        /// inheritedDoc
        public Task<string> GetHomePageUrlAsync(User user)
        {
            var configuration = StaticContext.IocManager.Resolve<IConfiguration>();
            var route = configuration["SheshaApp:HomeUrl"] ?? string.Empty;

            return Task.FromResult(route);
        }
    }
}
