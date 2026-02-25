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
        /// Frontend Application Redirects
        /// </summary>
        [Display(Name = "Application Redirects", Description = "This is the Application Redirects section", GroupName = "General")]
        [Setting(SheshaSettingNames.ApplicationRedirects, isClientSpecific: true, editorFormName: "application-redirects")]
        ISettingAccessor<FrontendApplicationRedirectsSettings> FrontendApplicationRedirectsSettings { get; }
    }
}
