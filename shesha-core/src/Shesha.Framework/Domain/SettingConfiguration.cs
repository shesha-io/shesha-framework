using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Threading.Tasks;

namespace Shesha.Domain
{
    public class SettingConfiguration: ConfigurationItemBase
    {
        public const string ItemTypeName = "setting-configuration";

        public override string ItemType => ItemTypeName;

        /// <summary>
        /// Data type of the value
        /// </summary>
        [StringLength(100)]
        public virtual string DataType { get; set; }

        [StringLength(200)]
        public virtual string EditorFormName { get; set; }
        
        [StringLength(200)]
        public virtual string EditorFormModule { get; set; }

        /// <summary>
        /// Allows ordering the setting in a logical manner within its category
        /// </summary>
        public virtual int OrderIndex { get; set; }

        /// <summary>
        /// Category of the setting, is used for groupping in the UI only
        /// </summary>
        [StringLength(200)]
        public virtual string Category { get; set; }

        /// <summary>
        /// If true, indicates that this setting should be specific to each of the application's clients
        /// </summary>
        public virtual bool IsClientSpecific { get; set; }

        /// <summary>
        /// Specifies who can access the application setting value via the APIs.
        /// </summary>
        [Column("AccessModeLkp")]
        public virtual SettingAccessMode AccessMode { get; set; }

        public override Task<IList<ConfigurationItemBase>> GetDependenciesAsync()
        {
            return Task.FromResult(new List<ConfigurationItemBase>() as IList<ConfigurationItemBase>);
        }
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
