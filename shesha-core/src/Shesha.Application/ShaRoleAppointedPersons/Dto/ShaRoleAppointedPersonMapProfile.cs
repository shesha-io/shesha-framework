using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Services;
using System;
using System.Collections.Generic;

namespace Shesha.ShaRoleAppointedPersons.Dto
{
    public class ShaRoleAppointedPersonMapProfile : Profile
    {
        public ShaRoleAppointedPersonMapProfile()
        {
            CreateMap<ShaRoleAppointedPersonDto, ShaRoleAppointedPerson>()
                .ForMember(u => u.Person, options => options.MapFrom(e =>
                    e.Person != null && e.Person.Id != null
                        ? GetEntity<Person, Guid>(e.Person.Id.Value)
                        : null));

            CreateMap<ShaRoleAppointedPerson, ShaRoleAppointedPersonDto>()
                .ForMember(u => u.Person, options => options.MapFrom(e => e.Person != null
                    ? new EntityReferenceDto<Guid?>(e.Person.Id, e.Person.GetDisplayName(), e.Person.GetType().GetRequiredFullName())
                    : null
                ));
        }

        private static T? GetEntity<T, TId>(TId id) where T : class, IEntity<TId>
        {
            if (EqualityComparer<TId>.Default.Equals(id, default(TId)))
                return null;

            var repo = StaticContext.IocManager.Resolve<IRepository<T, TId>>();
            return repo.Get(id);
        }
    }
}
