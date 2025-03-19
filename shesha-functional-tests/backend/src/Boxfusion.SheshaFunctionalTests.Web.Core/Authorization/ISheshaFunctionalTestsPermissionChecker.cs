using Shesha.Domain;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Authorization
{
    /// <summary>
    /// SheshaFunctionalTests Permission checker
    /// </summary>
    public interface ISheshaFunctionalTestsPermissionChecker
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="person"></param>
        /// <returns></returns>
        Task<bool> IsDataAdministratorAsync(Person person);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="person"></param>
        /// <returns></returns>
        Task<bool> IsGlobalAdminAsync(Person person);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="person"></param>
        /// <returns></returns>
        Task<bool> IsAdminAsync(Person person);
    }
}
