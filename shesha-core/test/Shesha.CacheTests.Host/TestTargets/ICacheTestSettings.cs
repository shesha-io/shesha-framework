using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Shesha.Settings;

namespace Shesha.CacheTests.Host.TestTargets
{
    /// <summary>
    /// A setting that exists purely so the coherence suite has something safe to write.
    ///
    /// Owned by this host rather than borrowed from another application: mutating a real framework
    /// setting would have blast radius, and depending on the functional-test app's settings is what
    /// tied this project to it in the first place.
    /// </summary>
    [Category("Cache tests")]
    public interface ICacheTestSettings : ISettingAccessors
    {
        /// <summary>
        /// Written and read back by the settings-coherence tests. Nothing else reads it, so any
        /// value is safe.
        /// </summary>
        [Display(Name = "Cache test value")]
        [Setting(CacheTestSettingNames.TestValue)]
        ISettingAccessor<int> TestValue { get; }
    }

    public static class CacheTestSettingNames
    {
        public const string TestValue = "TestValue";
    }
}
