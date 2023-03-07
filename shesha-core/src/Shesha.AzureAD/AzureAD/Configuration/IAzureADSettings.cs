using Shesha.Settings;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Shesha.AzureAD.Configuration
{
    /// <summary>
    /// AzureAD settings
    /// </summary>
    [Category("Azure AD")]
    public interface IAzureADSettings: ISettingAccessors
    {
        /// <summary>
        /// Is enabled
        /// </summary>
        [Display(Name = "Is enabled")]
        [SettingAttribute(AzureADSettingNames.IsEnabled)]
        ISettingAccessor<bool> IsEnabled { get; }

        /// <summary>
        /// Instance Url
        /// </summary>
        [Display(Name = "Instance Url")]
        [SettingAttribute(AzureADSettingNames.InstanceUrl)]
        ISettingAccessor<string> InstanceUrl { get; }

        /// <summary>
        /// Tenant
        /// </summary>
        [Display(Name = "Tenant")]
        [SettingAttribute(AzureADSettingNames.Tenant)]
        ISettingAccessor<string> Tenant { get; }

        /// <summary>
        /// App Id Uri
        /// </summary>
        [Display(Name = "App Id Uri")]
        [SettingAttribute(AzureADSettingNames.AppIdUri)]
        ISettingAccessor<string> AppIdUri { get; }

        /// <summary>
        /// Client Application Id
        /// </summary>
        [Display(Name = "Client Application Id")]
        [SettingAttribute(AzureADSettingNames.ClientApplicationId)]
        ISettingAccessor<string> ClientApplicationId { get; }
    }
}