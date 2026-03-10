using Abp.Auditing;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain
{
    /// <summary>
    /// Settings Configuration
    /// </summary>
    [JoinedProperty("setting_configurations", Schema = "frwk")]
    [SnakeCaseNaming]
    [DiscriminatorValue(ItemTypeName)]
    [Entity(FriendlyName = "Setting")]
    public class SettingConfiguration: ConfigurationItem
    {
        public const string ItemTypeName = "setting-configuration";

        public override string ItemType => ItemTypeName;

        /// <summary>
        /// Data type of the value
        /// </summary>
        [MaxLength(100)]
        [Audited]
        public virtual string DataType { get; set; }

        /// <summary>
        /// Data format
        /// </summary>
        [MaxLength(100)]
        [Audited]
        public virtual string? DataFormat { get; set; }

        /// <summary>
        /// TODO: V1 review replace with FormIdentifier
        /// </summary>
        [MaxLength(200)]
        [Audited]
        public virtual string? EditorFormName { get; set; }

        [MaxLength(200)]
        [Audited]
        public virtual string? EditorFormModule { get; set; }

        /// <summary>
        /// Allows ordering the setting in a logical manner within its category
        /// </summary>
        public virtual int OrderIndex { get; set; }

        /// <summary>
        /// Category of the setting, is used for groupping in the UI only
        /// </summary>
        [MaxLength(200)]
        [Audited]
        public virtual string? Category { get; set; }

        /// <summary>
        /// If true, indicates that this setting should be specific to each of the application's clients
        /// </summary>
        [Audited]
        public virtual bool IsClientSpecific { get; set; }

        /// <summary>
        /// Specifies who can access the application setting value via the APIs.
        /// </summary>
        [Audited]
        public virtual RefListSettingAccessMode AccessMode { get; set; } = RefListSettingAccessMode.Authenticated;

        /// <summary>
        /// If true, indicates that this setting should be specific to each of the logged in user
        /// </summary>
        [Audited]
        public virtual bool IsUserSpecific { get; set; }

        /// <summary>
        /// Indicate the accessibility of this user setting from client applications
        /// </summary>
        [Audited]
        public virtual RefListUserSettingAccessMode ClientAccess { get; set; } = RefListUserSettingAccessMode.ReadOnly;
    }
}