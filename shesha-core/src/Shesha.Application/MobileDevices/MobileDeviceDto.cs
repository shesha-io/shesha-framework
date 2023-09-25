using System;
using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using Shesha.Domain;

namespace Shesha.MobileDevices
{
    /// <summary>
    /// Registered mobile device DTO
    /// </summary>
    [AutoMap(typeof(MobileDevice))]
    public class MobileDeviceDto : EntityDto<Guid>
    {
        /// <summary>
        /// Device name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Device IMEI number
        /// </summary>
        public string IMEI { get; set; }

        /// <summary>
        /// Indicates that the device is locked
        /// </summary>
        public bool IsLocked { get; set; }

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
