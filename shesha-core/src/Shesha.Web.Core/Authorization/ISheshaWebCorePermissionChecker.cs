using Shesha.Domain;
using System.Threading.Tasks;

namespace Boxfusion.Authorization
{
    /// <summary>
    /// SheshaAspnetCoreDemo Permission checker
    /// </summary>
    public interface ISheshaWebCorePermissionChecker
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="person"></param>
        /// <returns></returns>
        Task<bool> IsDataAdministrator(Person person);
    }
}
