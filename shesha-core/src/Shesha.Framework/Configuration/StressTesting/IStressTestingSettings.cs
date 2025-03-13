using Shesha.Settings;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Configuration.StressTesting
{
    [Category("Stress Testing")]
    public interface IStressTestingSettings: ISettingAccessors
    {
        /// <summary>
        /// Stress Testing
        /// </summary>
        [Display(Name = "Stress Testing" , Description = "If checked, this will enable a GET API for retrieving an OTP using an email address or phone number.")]
        [Setting(SheshaSettingNames.EnableStressTestingSettings, EditorFormName = "stressTesting-settings")]
        ISettingAccessor<StressTestingSettings> StressTestingSettings { get; }
    }
}
