using Abp.Auditing;
using Shesha.Domain.Attributes;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Threading.Tasks;

namespace Shesha.Domain
{
    [JoinedProperty("Frwk_SettingConfigurations")]
    [DiscriminatorValue(ItemTypeName)]
    public class SettingConfiguration: ConfigurationItemBase
    {
        public const string ItemTypeName = "setting-configuration";

        public override string ItemType => ItemTypeName;

        /// <summary>
        /// Data type of the value
        /// </summary>
        [StringLength(100)]
        [Audited]
        public virtual string DataType { get; set; }

        [StringLength(200)]
        [Audited]
        public virtual string EditorFormName { get; set; }
        
        [StringLength(200)]
        [Audited]
        public virtual string EditorFormModule { get; set; }

        /// <summary>
        /// Allows ordering the setting in a logical manner within its category
        /// </summary>
        public virtual int OrderIndex { get; set; }

        /// <summary>
        /// Category of the setting, is used for groupping in the UI only
        /// </summary>
        [StringLength(200)]
        [Audited]
        public virtual string Category { get; set; }

        /// <summary>
        /// If true, indicates that this setting should be specific to each of the application's clients
        /// </summary>
        [Audited]
        public virtual bool IsClientSpecific { get; set; }

        /// <summary>
        /// Specifies who can access the application setting value via the APIs.
        /// </summary>
        [Column("AccessModeLkp")]
        [Audited]
        public virtual SettingAccessMode AccessMode { get; set; }

        /// <summary>
        /// If true, indicates that this setting should be specific to each of the logged in user
        /// </summary>
        [Audited]
        public virtual bool IsUserSpecific { get; set; }
        /// <summary>
        /// Indicate the accessibility of this user setting from client applications
        /// </summary>
        [Column("ClientAccessLkp")]
        [Audited]
        public virtual UserSettingAccessMode ClientAccess { get; set; }
    }

    /// <summary>
    /// Indicate the accessibility of this user setting from client applications.
    /// </summary>
    public enum UserSettingAccessMode
    {
        [Display(Name = "Not Accessible", Description = "Client Applications cannot access the setting. It is only used for a backend purposes.")]
        NotAccessible = 1,

        [Display(Name = "Read-only", Description = "Client Applications can read the setting, but cannot update it.")]
        ReadOnly = 2,

        [Display(Name = "Full", Description = "Client Applications can both read and update the setting.")]
        Full = 3,
    }

    /// <summary>
    /// Specifies who can access the application setting value via the APIs.
    /// </summary>
    public enum SettingAccessMode 
    {
        [Display(Name = "Back-end only", Description = "Only back-end code can access the settings at run-time (i.e. it is not exposed via the APIs) except to Developers, Configurators, and Admin through the Admin panels.")]
        BackEndOnly = 1,

        [Display(Name = "Authenticated", Description = "Any authenticated user may access the value of the setting via the API.")]
        Authenticated = 2,

        [Display(Name = "Anonymous", Description = "The setting value can be retrieved via API by anyone even anonymous users.")]
        Anonymous = 3, 
    }
}
