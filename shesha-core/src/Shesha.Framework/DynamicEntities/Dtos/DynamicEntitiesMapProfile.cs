using Shesha.AutoMapper;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using Shesha.Metadata.Dtos;
using Shesha.Reflection;
using Shesha.Services;
using System;
using System.Linq;

namespace Shesha.DynamicEntities.Dtos
{
    public class DynamicEntitiesMapProfile: ShaProfile
    {
        public DynamicEntitiesMapProfile()
        {
            CreateMap<EntityConfigDto, EntityConfig>();
            CreateMap<EntityConfig, EntityConfigDto>()
                .ForMember(e => e.Suppress, c => c.MapFrom(e => e.Suppress))
                .ForMember(e => e.Name, c => c.MapFrom(e => e.Name))

                .ForMember(e => e.Module, c => c.MapFrom(e => e.Module != null ? e.Module.Name : ""))
                .ForMember(e => e.ModuleId, c => c.MapFrom(e => e.Module != null ? e.Module.Id : Guid.Empty))
                .ForMember(e => e.InheritedFrom, c => c.MapFrom(e => e.InheritedFrom != null ? e.InheritedFrom.FullClassName : ""))
                .ForMember(e => e.InheritedFromId, c => c.MapFrom(e => e.InheritedFrom != null ? e.InheritedFrom.Id : Guid.Empty))
                ;

            CreateMap<EntityPropertyDto, EntityProperty>();
            CreateMap<EntityProperty, EntityPropertyDto>()
                .ForMember(e => e.EntityConfigId, c => c.MapFrom(e => e.EntityConfig.Id))
                // ToDo: AS - V1 review mapping
                .ForMember(e => e.EntityConfigName, c => c.MapFrom(e => e.EntityConfig.FullClassName))
                .ForMember(e => e.InheritedFrom, c => c.MapFrom(e => e.InheritedFrom != null ? e.InheritedFrom.Name : ""))
                .ForMember(e => e.InheritedFromId, c => c.MapFrom(e => e.InheritedFrom != null ? e.InheritedFrom.Id : Guid.Empty))

                ;

            CreateMap<EntityProperty, ModelPropertyDto>()
                .ForMember(e => e.Properties, c => c.MapFrom(e => e.Properties.OrderBy(p => p.SortOrder).ToList()))
                .ForMember(e => e.IsItemsType, c => c.MapFrom(e => e.ParentProperty != null && e.ParentProperty.ItemsType == e))
                .ForMember(e => e.InheritedFromId, c => c.MapFrom(e => e.InheritedFrom != null ? e.InheritedFrom.Id : (Guid?)null))
                .ForMember(e => e.IsChildProperty, c => c.MapFrom(e => e.ParentProperty != null))
                .ForMember(e => e.ReferenceListId, c => c.MapFrom(e => string.IsNullOrEmpty(e.ReferenceListName) ? null : new ReferenceListIdentifier(e.ReferenceListModule, e.ReferenceListName)))
                ;

            CreateMap<EntityConfig, ModelConfigurationDto>()
                .ForMember(e => e.InheritedFromId, m => m.MapFrom(e => e.InheritedFrom != null ? e.InheritedFrom.Id : (Guid?)null))
                .ForMember(e => e.InheritedFromClassName, m => m.MapFrom(e => e.InheritedFrom != null ? e.InheritedFrom.ClassName : null))
                .ForMember(e => e.InheritedFromNamespace, m => m.MapFrom(e => e.InheritedFrom != null ? e.InheritedFrom.Namespace : null))
                .ForMember(e => e.Properties, c => c.Ignore())
                .ForMember(e => e.Permission, c => c.Ignore())
                .ForMember(e => e.PermissionCreate, c => c.Ignore())
                .ForMember(e => e.PermissionGet, c => c.Ignore())
                .ForMember(e => e.PermissionUpdate, c => c.Ignore())
                .ForMember(e => e.PermissionDelete, c => c.Ignore())
                .ForMember(e => e.ModuleId, m => m.MapFrom(e => e.Module != null ? e.Module.Id : (Guid?)null))
                .ForMember(e => e.Module, m => m.MapFrom(e => e.Module != null ? e.Module.Name : null))
                .ForMember(e => e.Name, m => m.MapFrom(e => e.Name))
                .ForMember(e => e.Suppress, c => c.MapFrom(e => e.Suppress))

                .ForMember(e => e.Label, m => m.MapFrom(e => e.Label))
                .ForMember(e => e.Description, m => m.MapFrom(e => e.Description))
                .ForMember(e => e.NotImplemented, c => c.MapFrom(e => e.Source == MetadataSourceType.ApplicationCode
                        && StaticContext.IocManager.Resolve<EntityConfigurationStore>().GetOrNull(e.FullClassName) == null))
                .ForMember(e => e.AllowConfigureAppService, c => c.MapFrom(e => e.Source == MetadataSourceType.ApplicationCode 
                        && AllowConfigureAppService(e)))
                ;

            CreateMap<ModelPropertyDto, PropertyMetadataDto>()
                .ForMember(e => e.Path, c => c.MapFrom(e => e.Name))
                .ForMember(e => e.IsVisible, c => c.MapFrom(e => !e.Suppress))
                .ForMember(e => e.OrderIndex, c => c.MapFrom(e => e.SortOrder ?? 0))
                .ForMember(e => e.EntityType, c => c.MapFrom(e => e.EntityType))
                .ForMember(e => e.EntityModule, c => c.MapFrom(e => e.EntityModule))
                .ForMember(e => e.EntityModule, c => c.MapFrom(e => e.EntityModule))
                .ForMember(e => e.ReferenceListModule, c => c.MapFrom(e => e.ReferenceListId != null ? e.ReferenceListId.Module : null))
                .ForMember(e => e.ReferenceListName, c => c.MapFrom(e => e.ReferenceListId != null ? e.ReferenceListId.Name : null))
                ;
        }

        private bool AllowConfigureAppService(EntityConfig entityConfig)
        {
            var attr = StaticContext.IocManager.Resolve<IEntityConfigurationStore>().GetOrNull(entityConfig.FullClassName)?.EntityType?.GetAttributeOrNull<EntityAttribute>();
            return attr == null || attr.GenerateApplicationService == GenerateApplicationServiceState.UseConfiguration;
        }
    }
}