using JetBrains.Annotations;
using System.Threading.Tasks;

namespace Shesha.Settings
{
    /// <summary>
    /// Setting manager
    /// </summary>
    public interface IShaSettingManager
    {
        /// <summary>
        /// Get setting value
        /// </summary>
        /// <param name="module">Module name</param>
        /// <param name="name">Setting name</param>
        /// <param name="context"></param>
        /// <returns></returns>
        Task<object> GetOrNullAsync([NotNull] string module, [NotNull] string name, SettingManagementContext context = null);

        /// <summary>
        /// Get setting value or null
        /// </summary>
        /// <param name="module">Module name</param>
        /// <param name="name">Setting name</param>
        /// <param name="context"></param>
        /// <returns></returns>
        Task<TValue> GetOrNullAsync<TValue>([NotNull] string module, [NotNull] string name, SettingManagementContext context = null);

        /// <summary>
        /// Get setting value or null
        /// </summary>
        /// <param name="module">Module name</param>
        /// <param name="name">Setting name</param>
        /// <param name="context"></param>
        /// <returns></returns>
        TValue GetOrNull<TValue>([NotNull] string module, [NotNull] string name, SettingManagementContext context = null);

        /// <summary>
        /// Set setting value
        /// </summary>
        /// <param name="module">Module name</param>
        /// <param name="name">Setting name</param>
        /// <param name="value">Setting value</param>
        /// <param name="context"></param>
        /// <returns></returns>
        Task SetAsync<TValue>([NotNull] string module, [NotNull] string name, [CanBeNull] TValue value, SettingManagementContext context = null);
    }
}
