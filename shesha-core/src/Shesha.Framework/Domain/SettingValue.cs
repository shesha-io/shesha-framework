using Abp.Auditing;
using Abp.Domain.Entities.Auditing;
using Shesha.Authorization.Users;
using Shesha.Domain.Attributes;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    /// <summary>
    /// Setting value
    /// </summary>
    [SnakeCaseNaming]
    [Table("setting_values", Schema = "frwk")]
    public class SettingValue: AuditedEntity<Guid>, IMayHaveFrontEndApplication, IMayHaveUser
    {
        /// <summary>
        /// Setting definition
        /// </summary>
        public required virtual SettingConfiguration SettingConfiguration { get; set; }

        /// <summary>
        /// Setting value in JSON format
        /// </summary>
        [MaxLength(int.MaxValue)]
        [Audited]
        public virtual string? Value { get; set; }

        /// <summary>
        /// Front-end application, is used for application specific settings only
        /// </summary>
        [Audited]
        public virtual FrontEndApp? Application { get; set; }

        /// <summary>
        /// This is used for user specific settings only
        /// </summary>
        [Audited]
        public virtual User? User { get; set; }
    }
}
