using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Shesha.Authorization.Users;
using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    /// <summary>
    /// Registered mobile device. Is used to restrict access and identify 
    /// </summary>
    [Entity(GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    public class MobileDevice: FullAuditedEntity<Guid>
    {
        /// <summary>
        /// Device name
        /// </summary>
        [StringLength(300)]
        public virtual string Name { get; set; }
        
        /// <summary>
        /// Device name
        /// </summary>
        public virtual string ReadRouteName { get; set; }

        /// <summary>
        /// Device IMEI number
        /// </summary>
        [StringLength(30)]
        public virtual string IMEI { get; set; }

        /// <summary>
        /// Indicates that the device is locked
        /// </summary>
        public virtual bool IsLocked { get; set; }

        /// <summary>
        /// A user who created the device
        /// </summary>
        [ForeignKey("CreatorUserId")]
        public virtual User CreatorUser { get; set; }
    }
}