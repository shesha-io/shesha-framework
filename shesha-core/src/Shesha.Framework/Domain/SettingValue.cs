using Abp.Domain.Entities.Auditing;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain
{
    /// <summary>
    /// Setting value
    /// </summary>
    public class SettingValue: AuditedEntity<Guid>
    {
        /// <summary>
        /// Setting definition
        /// </summary>
        public virtual SettingConfiguration SettingConfiguration { get; set; }

        /// <summary>
        /// Setting value in JSON format
        /// </summary>
        [StringLength(int.MaxValue)]
        public virtual string Value { get; set; }

        /// <summary>
        /// Front-end application, is used for application specific settings only
        /// </summary>
        public virtual FrontEndApp Application { get; set; }
    }
}
