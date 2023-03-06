using DocumentFormat.OpenXml.Wordprocessing;
using Shesha.Configuration;
using Shesha.Settings;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Push.Configuration
{
    /// <summary>
    /// Push Settings
    /// </summary>
    [Category("Push")]
    public interface IPushSettings: ISettingAccessors
    {
        /// <summary>
        /// Push Notifier
        /// </summary>
        [Display(Name = "Push Notifier")]
        [SettingAttribute(SheshaSettingNames.Push.PushNotifier)]
        ISettingAccessor<string> PushNotifier { get; }
    }
}
