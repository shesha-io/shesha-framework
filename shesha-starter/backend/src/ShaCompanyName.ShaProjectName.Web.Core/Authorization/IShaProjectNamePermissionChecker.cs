using Shesha.Domain;
using System.Threading.Tasks;

namespace ShaCompanyName.ShaProjectName.Common.Authorization
{
    /// <summary>
    /// ShaProjectName Permission checker
    /// </summary>
    public interface IShaProjectNamePermissionChecker
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="person"></param>
        /// <returns></returns>
        Task<bool> IsDataAdministrator(Person person);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="person"></param>
        /// <returns></returns>
        Task<bool> IsGlobalAdmin(Person person);

        ///// <summary>
        ///// 
        ///// </summary>
        ///// <param name="person"></param>
        ///// <returns></returns>
        //Task<bool> IsFacilityAdmin(Person person);

        ///// <summary>
        ///// 
        ///// </summary>
        ///// <param name="person"></param>
        ///// <returns></returns>
        //Task<bool> IsCapturer(Person person);

        ///// <summary>
        ///// 
        ///// </summary>
        ///// <param name="person"></param>
        ///// <returns></returns>
        //Task<bool> IsViewer(Person person);

        ///// <summary>
        ///// 
        ///// </summary>
        ///// <param name="person"></param>
        ///// <returns></returns>
        //Task<bool> IsApproverLevel1(Person person);

        ///// <summary>
        ///// 
        ///// </summary>
        ///// <param name="person"></param>
        ///// <returns></returns>
        //Task<bool> IsApproverLevel2(Person person);

        ///// <summary>
        ///// 
        ///// </summary>
        ///// <param name="person"></param>
        ///// <returns></returns>
        //Task<bool> IsManager(Person person);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="person"></param>
        /// <returns></returns>
        Task<bool> IsAdmin(Person person);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="person"></param>
        /// <returns></returns>
        //Task<bool> IsScheduleManager(Person person);

        ///// <summary>
        ///// 
        ///// </summary>
        ///// <param name="person"></param>
        ///// <returns></returns>
        //Task<bool> IsScheduleFulfiller(Person person);
    }
}
