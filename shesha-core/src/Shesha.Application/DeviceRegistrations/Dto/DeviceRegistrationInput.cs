using Abp.AutoMapper;
using Shesha.Domain;

namespace Shesha.DeviceRegistrations.Dto
{
    /// <summary>
    /// Registered mobile device DTO
    /// </summary>
    [AutoMap(typeof(DeviceRegistration))]
    public class DeviceRegistrationInput 
    {
        public string DeviceRegistrationId { get; set; }
    }
}
