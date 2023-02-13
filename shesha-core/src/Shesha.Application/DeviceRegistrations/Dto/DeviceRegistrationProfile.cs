using System;
using Shesha.AutoMapper;
using Shesha.Domain;

namespace Shesha.DeviceRegistrations.Dto
{
    public class DeviceRegistrationProfile: ShaProfile
    {
        public DeviceRegistrationProfile()
        {
            CreateMap<DeviceRegistrationDto, DeviceRegistration>()
                .ForMember(e => e.Person, m => m.MapFrom(e => GetEntity<Person, Guid>(e.PersonId)));

            CreateMap<DeviceRegistration, DeviceRegistrationDto> ()
                .ForMember(e => e.PersonId, m => m.MapFrom(e => e.Person != null ? e.Person.Id : (Guid?)null));
        }
    }
}
