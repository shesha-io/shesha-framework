using System.Threading.Tasks;

namespace Shesha.Settings
{
    /// <summary>
    /// Setting accessor. Is used to read/write setting value
    /// </summary>
    public interface ISettingAccessor
    {
        /// <summary>
        /// Get default value
        /// </summary>
        /// <returns></returns>
        object? GetDefaultValue();
    }

    /// <summary>
    /// Setting accessor. Is used to read/write setting value
    /// </summary>
    public interface ISettingAccessor<TValue> : ISettingAccessor
    {
        /// <summary>
        /// Get setting value
        /// </summary>
        Task<TValue?> GetValueOrNullAsync(SettingManagementContext? context = null);

        /// <summary>
        /// Get setting value
        /// </summary>
        Task<TValue> GetValueAsync(SettingManagementContext? context = null);

        /// <summary>
        /// Get setting value
        /// </summary>
        TValue? GetValueOrNull(SettingManagementContext? context = null);

        /// <summary>
        /// Get setting value
        /// </summary>
        TValue GetValue(SettingManagementContext? context = null);

        /// <summary>
        /// Set setting value
        /// </summary>
        Task SetValueAsync(TValue? value);

        /// <summary>
        /// Sets default value of the setting
        /// </summary>
        /// <param name="value"></param>
        void WithDefaultValue(TValue value);
    }
}
