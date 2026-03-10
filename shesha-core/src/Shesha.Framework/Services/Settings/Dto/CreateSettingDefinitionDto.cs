using Shesha.Domain.Enums;
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
        public required string Name { get; set; }

        /// <summary>
        /// Label
        /// </summary>
        public string? Label { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Setting category
        /// </summary>
        public string? Category { get; set; }

        /// <summary>
        /// Data type of the value
        /// </summary>
        [MaxLength(100)]
        public required string DataType { get; set; }

        [MaxLength(200)]
        public string? EditorFormName { get; set; }

        [MaxLength(200)]
        public string? EditorFormModule { get; set; }

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
        public RefListSettingAccessMode AccessMode { get; set; }

        /// <summary>
        /// If true, indicates that this setting should be specific to each of the logged in user
        /// </summary>
        public bool IsUserSpecific { get; set; }

        /// <summary>
        /// Indicate the accessibility of this user setting from client applications
        /// </summary>
        public RefListUserSettingAccessMode ClientAccess { get; set; }
    }
}
