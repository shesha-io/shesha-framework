using Abp.Auditing;
using Abp.Domain.Entities.Auditing;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain
{
    /// <summary>
    /// Setting value
    /// </summary>
    public class SettingValue: AuditedEntity<Guid>, IMayHaveFrontEndApplication
    {
        /// <summary>
        /// Setting definition
        /// </summary>
        public virtual SettingConfiguration SettingConfiguration { get; set; }

        /// <summary>
        /// Setting value in JSON format
        /// </summary>
        [StringLength(int.MaxValue)]
        [Audited]
        public virtual string Value { get; set; }

        /// <summary>
        /// Front-end application, is used for application specific settings only
        /// </summary>
        [Audited]
        public virtual FrontEndApp Application { get; set; }
    }
}
