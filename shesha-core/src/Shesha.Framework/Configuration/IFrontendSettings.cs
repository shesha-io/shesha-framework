using Shesha.Settings;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Configuration
{
    public interface IFrontendSettings: ISettingAccessors
    {
        /// <summary>
        /// Theme settings  
        /// </summary>
        [Display(Name = "Theme settings", Description = "", GroupName = "Frontend")]
        [Setting(SheshaSettingNames.ThemeSettings, isClientSpecific: true, editorFormName: "theme-settings")]
        ISettingAccessor<ThemeSettings> Theme { get; }

        /// <summary>
        /// Main menu settings  
        /// </summary>
        [Display(Name = "Main menu settings", Description = "", GroupName = "Frontend")]
        [Setting(SheshaSettingNames.MainMenuSettings, isClientSpecific: true, editorFormName: "main-menu-settings")]
        ISettingAccessor<MainMenuSettings> MainMenu { get; }

        /// <summary>
        /// Default URL  
        /// </summary>
        [Display(Name = "Default URL", Description = "This is the url the user should be redirected to if the user is not authenticated and does not specify a specific page", GroupName = "Frontend")]
        [Setting(SheshaSettingNames.DefaultUrl, isClientSpecific: true)]
        ISettingAccessor<string> DefaultUrl { get; }

        /// <summary>
        /// Public URL  
        /// </summary>
        [Display(Name = "Public URL", Description = "Is used in the notifications (especially emails) to open site links", GroupName = "Frontend")]
        [Setting(SheshaSettingNames.PublicUrl, isClientSpecific: true)]
        ISettingAccessor<string> PublicUrl { get; }
    }
}
