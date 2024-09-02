using Shesha.Domain;
using Shesha.Settings;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
    }
}
