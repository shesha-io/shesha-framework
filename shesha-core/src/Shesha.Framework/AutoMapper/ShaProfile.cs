using System;
using Abp.Application.Services.Dto;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Localization;
using AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using Shesha.Services;

namespace Shesha.AutoMapper
{
    public abstract class ShaProfile : Profile
    {
        protected static ReferenceListItemValueDto GetRefListItemValueDto(string refListNamespace, string refListName, int? value) 
        {
            return GetRefListItemValueDto(null, refListNamespace, refListName, value);
        }

        // todo: implement automapper convention for reference lists
        protected static ReferenceListItemValueDto GetRefListItemValueDto(string refListModule, string refListNamespace, string refListName, int? value)
        {
            return value != null
                ? new ReferenceListItemValueDto
                {
                    ItemValue = value.Value,
                    Item = GetRefListItemText(refListModule, refListNamespace, refListName, value)
                }
                : null;
        }

        // todo: implement automapper convention for reference lists
        protected static string GetRefListItemText(string refListModule, string refListNamespace, string refListName, int? value)
        {
            if (value == null)
                return null;
            var helper = StaticContext.IocManager.Resolve<IReferenceListHelper>();
            return helper.GetItemDisplayText(new ReferenceListIdentifier(refListModule, refListNamespace, refListName), value);
        }

        // todo: implement automapper convention for nested entities
        protected static T GetEntity<T, TId>(EntityDto<TId> dto) where T : class, IEntity<TId>
        {
            return dto == null
                ? null
                : GetEntity<T, TId>(dto.Id);
        }

        protected static T GetEntity<T, TId>(TId id) where T : class, IEntity<TId>
        {
            if (id == null || id is Guid guid && guid == Guid.Empty)
                return null;

            var repo = StaticContext.IocManager.Resolve<IRepository<T, TId>>();
            return repo.Get(id);
        }

        protected static T GetEntity<T>(EntityReferenceDto<Guid?> dto) where T : class, IEntity<Guid>
        {
            if (dto?.Id == null || dto.Id == Guid.Empty)
                return null;

            var repo = StaticContext.IocManager.Resolve<IRepository<T, Guid>>();
            return repo.Get(dto.Id.Value);
        }

        protected static T GetEntity<T>(Guid? id) where T : class, IEntity<Guid>
        {
            if (id == null || id == Guid.Empty)
                return null;

            var repo = StaticContext.IocManager.Resolve<IRepository<T, Guid>>();
            return repo.Get(id.Value);
        }

        protected static string Localize(ILocalizableString str)
        {
            var lManager = StaticContext.IocManager.Resolve<ILocalizationManager>();
            return str.Localize(lManager);
        }
    }
}
