using Shesha.Domain;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Services.Settings.Dto
{
    /// <summary>
    /// DTO that is used for Setting Definition creation
    /// </summary>
    public class CreateSettingDefinitionDto
    {
        /// <summary>
        /// Module id
        /// </summary>
        public Guid? ModuleId { get; set; }

        /// <summary>
        /// Reference list name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Label
        /// </summary>
        public string Label { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Setting category
        /// </summary>
        public string Category { get; set; }

        /// <summary>
        /// Data type of the value
        /// </summary>
        [StringLength(100)]
        public string DataType { get; set; }

        [StringLength(200)]
        public string EditorFormName { get; set; }

        [StringLength(200)]
        public string EditorFormModule { get; set; }

        /// <summary>
        /// Allows ordering the setting in a logical manner within its category
        /// </summary>
        public int OrderIndex { get; set; }

        /// <summary>
        /// If true, indicates that this setting should be specific to each of the application's clients
        /// </summary>
        public bool IsClientSpecific { get; set; }

        /// <summary>
        /// Specifies who can access the application setting value via the APIs.
        /// </summary>
        public SettingAccessMode AccessMode { get; set; }

        /// <summary>
        /// If true, indicates that this setting should be specific to each of the logged in user
        /// </summary>
        public virtual bool IsUserSpecific { get; set; }

        /// <summary>
        /// Indicate the accessibility of this user setting from client applications
        /// </summary>
        public virtual UserSettingAccessMode ClientAccess { get; set; }
    }
}
