using System;
using System.Collections.Generic;
using System.Linq;
using Abp.Domain.Repositories;
using AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using Shesha.Extensions;

namespace Shesha.ShaRoleAppointedPersons.Dto
{
    public class ShaRoleAppointedPersonMapProfile : Profile
    {
        private readonly IRepository<ShaRoleAppointmentEntity, Guid> _appEntityRepository;

        public ShaRoleAppointedPersonMapProfile(IRepository<ShaRoleAppointmentEntity, Guid> appEntityRepository)
        {
            _appEntityRepository = appEntityRepository;
        }

        public ShaRoleAppointedPersonMapProfile()
        {
            CreateMap<ShaRoleAppointedPersonDto, ShaRoleAppointedPerson>();
            CreateMap<ShaRoleAppointedPerson, ShaRoleAppointedPersonDto>()
                .ForMember(u => u.Person, options => options.MapFrom(e => e.Person != null
                    ? new EntityReferenceDto<Guid?>(e.Person.Id, e.Person.FullName, e.Person.GetClassName()) : null))
                .ForMember(u => u.RoleId, options => options.MapFrom(e => e.Role != null ? e.Role.Id : (Guid?)null))
                .ForMember(u => u.Regions, options => options.MapFrom(e => GetRegions(e)));
        }

        /*
        public static List<Guid> GetRegions(ShaRoleAppointedPerson entity)
        {
            var regionTypeShortAlias = typeof(Area).GetEntityConfiguration().TypeShortAlias;

            var appEntityRepository = StaticContext.IocManager.Resolve<IRepository<ShaRoleAppointmentEntity, Guid>>();

            var linkedRegions = appEntityRepository.GetAll().Where(e => e.Appointment == entity && e.EntityTypeAlias == regionTypeShortAlias)
                .ToList();
            var ids = linkedRegions.Select(r => r.EntityId.ToGuid()).Where(id => id != Guid.Empty).ToList();
            
            return ids;
        }
        */
        public static List<EntityReferenceDto<Guid>> GetRegions(ShaRoleAppointedPerson entity)
        {
            return entity.GetRelatedAreas().Select(e => new EntityReferenceDto<Guid>(e.Id, e.Name, e.GetClassName())).ToList();
        }
    }
}
