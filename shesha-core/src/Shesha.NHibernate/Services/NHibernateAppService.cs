using Abp.Application.Services;
using Abp.Web.Models;
using Shesha.NHibernate.Maps;
using System.Threading.Tasks;

namespace Shesha.Services
{
    /// <summary>
    /// NHibernate application service
    /// </summary>
    public class NHibernateAppService: IApplicationService
    {
        /// <summary>
        /// Get last compiled mapping conventions
        /// </summary>
        /// <returns></returns>
        [DontWrapResult]
        public Task<string> GetConventions()
        {
            return Task.FromResult(Conventions.LastCompiledXml);
        }
    }
}
