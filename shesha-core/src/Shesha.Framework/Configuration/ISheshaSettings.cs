using Shesha.Domain;
using Shesha.Settings;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Configuration
{
    /// <summary>
    /// Shesha settings
    /// </summary>
    public interface ISheshaSettings : ISettingAccessors
    {
        /// <summary>
        /// Upload folder for stored files (<see cref="StoredFile"/>) 
        /// </summary>
        [Display(Name = "Upload Folder", Description = "Upload folder for stored files", GroupName = "General")]
        [Setting(SheshaSettingNames.UploadFolder)]
        ISettingAccessor<string> UploadFolder { get; }

        /// <summary>
        /// 
        /// </summary>
        [Display(Name = "Testing User Specific", Description = "Testing User Specific Settings", GroupName = "General")]
        [Setting(SheshaSettingNames.TestUserSpecific,IsUserSpecific= true)]
        ISettingAccessor<string> TestingUser { get; }

        /// <summary>
        /// 
        /// </summary>
        [Display(Name = "Current Organistion", Description = "Current Organisation Settings", GroupName = "General")]
        [Setting(SheshaSettingNames.CurrentOrganisation, IsUserSpecific = true, EditorFormName ="current-organisation-settings")]
        ISettingAccessor<OrganisationAccountSettings> CurrentOrganisation { get; }
    }
}
