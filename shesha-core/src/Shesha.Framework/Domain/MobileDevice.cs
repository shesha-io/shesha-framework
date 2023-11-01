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
    [Discriminator]
    public class MobileDevice: FullAuditedEntity<Guid>
    {
        /// <summary>
        /// Device name
        /// </summary>
        [StringLength(300)]
        public virtual string Name { get; set; }
        
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


        /// <summary>
        /// The timestamp of the last heartbeat received from the device.
        /// </summary>
        public DateTime? LastHeartBeatTime { get; set; }

        /// <summary>
        /// The last known location of the device as per the last heartbeat received.
        /// </summary>
        public Decimal? LastLat { get; set; }

        /// <summary>
        /// The last known location of the device as per the last heartbeat received.
        /// </summary>
        public Decimal? LastLong { get; set; }

        /// <summary>
        /// The last known bearing (direction) of the device as per the last heartbeat received.
        /// </summary>
        public Decimal? LastBearing { get; set; }

        /// <summary>
        /// The last known speed of the device as per the last heartbeat received.
        /// </summary>
        public Decimal? LastSpeed { get; set; }

        /// <summary>
        /// Indicates if the devices was stationary as of the last heartbeat.
        /// This is either based on the speed being below a certain threshold or
        /// the device being in the same location for a certain period of time.
        /// </summary>
        public bool? LastHeartBeatIsStationary { get; set; }
        
        /// <summary>
        /// The timestamp the device was first recorded at the current location.
        /// This is used to determine how long the device has been stationary.
        /// </summary>
        public DateTime? StationaryTime { get; set; }

        /// <summary>
        /// The lat the device was first recorded at the current location.
        /// </summary>
        public Decimal? StationaryLat { get; set; }

        /// <summary>
        /// The long the device was first recorded at the current location.
        /// </summary>
        public Decimal? StationaryLong { get; set; }

    }
}