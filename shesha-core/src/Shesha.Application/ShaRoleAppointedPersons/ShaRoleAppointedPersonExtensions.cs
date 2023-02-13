using System;
using System.Collections.Generic;
using System.Linq;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.Domain;
using Shesha.Services;
using Shesha.Utilities;

namespace Shesha.ShaRoleAppointedPersons
{
    public static class ShaRoleAppointedPersonExtensions
    {
        public static string GetRelatedAreasText(this ShaRoleAppointedPerson entity)
        {
            var appEntitiesRepository = StaticContext.IocManager.Resolve<IRepository<ShaRoleAppointmentEntity, Guid>>();
            var areaTypeShortAlias = typeof(Area).GetEntityConfiguration().TypeShortAlias;
            var areasIds = appEntitiesRepository.GetAll()
                .Where(e => e.Appointment == entity && e.EntityTypeAlias == areaTypeShortAlias).Select(e => e.EntityId)
                .ToList()
                .Select(id => id.ToGuid())
                .ToList();
            
            var areaRepository = StaticContext.IocManager.Resolve<IRepository<Area, Guid>>();
            var result = areaRepository.GetAll().Where(e => areasIds.Contains(e.Id)).Select(e => e.Name).OrderBy(n => n)
                .Delimited(",");
            return result;
        }

        public static List<Area> GetRelatedAreas(this ShaRoleAppointedPerson entity)
        {
            var appEntitiesRepository = StaticContext.IocManager.Resolve<IRepository<ShaRoleAppointmentEntity, Guid>>();
            var areaTypeShortAlias = typeof(Area).GetEntityConfiguration().TypeShortAlias;
            var areasIds = appEntitiesRepository.GetAll()
                .Where(e => e.Appointment == entity && e.EntityTypeAlias == areaTypeShortAlias).Select(e => e.EntityId)
                .ToList()
                .Select(id => id.ToGuid())
                .ToList();

            var areaRepository = StaticContext.IocManager.Resolve<IRepository<Area, Guid>>();
            var result = areaRepository.GetAll().Where(e => areasIds.Contains(e.Id)).OrderBy(a => a.Name).ToList();
            return result;
        }
    }
}
