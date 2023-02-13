using System;
using System.ComponentModel.DataAnnotations;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.DeviceRegistration")]
    public class DeviceRegistration : FullAuditedEntity<Guid>
    {
        /// <summary>
        /// Mobile User
        /// </summary>
        public virtual Person Person { get; set; }
        /// <summary>
        /// Registration Token
        /// </summary>
        [StringLength(1000)]
        public virtual string DeviceRegistrationId { get; set; }
        /// <summary>
        /// Application ID
        /// </summary>
        [StringLength(1000)]
        public virtual string AppId { get; set; }
    }
}
