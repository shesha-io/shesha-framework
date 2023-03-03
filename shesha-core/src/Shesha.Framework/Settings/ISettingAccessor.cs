using System.Threading.Tasks;

namespace Shesha.Settings
{
    /// <summary>
    /// Setting accessor. Is used to read/write setting value
    /// </summary>
    public interface ISettingAccessor
    {
    }

    /// <summary>
    /// Setting accessor. Is used to read/write setting value
    /// </summary>
    public interface ISettingAccessor<TValue> : ISettingAccessor
    {
        /// <summary>
        /// Get setting value
        /// </summary>
        Task<TValue> GetValueAsync();

        /// <summary>
        /// Get setting value
        /// </summary>
        TValue GetValue();

        /// <summary>
        /// Set setting value
        /// </summary>
        Task SetValueAsync(TValue value);
    }
}
