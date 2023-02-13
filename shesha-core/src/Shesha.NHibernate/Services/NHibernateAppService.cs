using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Web.Models;
using Shesha.NHibernate.Maps;

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
        public async Task<string> GetConventions()
        {
            return Conventions.LastCompiledXml;
        }
    }
}
