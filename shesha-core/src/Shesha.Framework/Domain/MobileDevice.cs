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
    [SnakeCaseNaming]
    [Table("mobile_devices", Schema = "frwk")]
    [Entity(GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    [Discriminator]
    public class MobileDevice: FullAuditedEntity<Guid>
    {
        /// <summary>
        /// Device name
        /// </summary>
        [MaxLength(300)]
        public virtual string Name { get; set; }
        
        /// <summary>
        /// Device IMEI number
        /// </summary>
        [MaxLength(30)]
        public virtual string IMEI { get; set; }

        /// <summary>
        /// Indicates that the device is locked
        /// </summary>
        public virtual bool IsLocked { get; set; }

        /// <summary>
        /// A user who created the device
        /// </summary>
        [ForeignKey("creator_user_id")]
        public virtual User CreatorUser { get; set; }

        /// <summary>
        /// The timestamp of the last heartbeat received from the device.
        /// </summary>
        public virtual DateTime? LastHeartBeatTime { get; set; }

        /// <summary>
        /// The last known location of the device as per the last heartbeat received.
        /// </summary>
        public virtual Decimal? LastLat { get; set; }

        /// <summary>
        /// The last known location of the device as per the last heartbeat received.
        /// </summary>
        public virtual Decimal? LastLong { get; set; }

        /// <summary>
        /// The last known bearing (direction) of the device as per the last heartbeat received.
        /// </summary>
        public virtual Decimal? LastBearing { get; set; }

        /// <summary>
        /// The last known speed of the device as per the last heartbeat received.
        /// </summary>
        public virtual Decimal? LastSpeed { get; set; }

        /// <summary>
        /// Indicates if the devices was stationary as of the last heartbeat.
        /// This is either based on the speed being below a certain threshold or
        /// the device being in the same location for a certain period of time.
        /// </summary>
        public virtual bool? LastHeartBeatIsStationary { get; set; }
        
        /// <summary>
        /// The timestamp the device was first recorded at the current location.
        /// This is used to determine how long the device has been stationary.
        /// </summary>
        public virtual DateTime? StationaryTime { get; set; }

        /// <summary>
        /// The lat the device was first recorded at the current location.
        /// </summary>
        public virtual Decimal? StationaryLat { get; set; }

        /// <summary>
        /// The long the device was first recorded at the current location.
        /// </summary>
        public virtual Decimal? StationaryLong { get; set; }

    }
}