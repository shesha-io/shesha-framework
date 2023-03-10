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
