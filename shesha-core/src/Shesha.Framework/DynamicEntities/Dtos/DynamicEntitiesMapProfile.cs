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
            CreateMap<EntityConfigDto, EntityConfig>()
                ;
            CreateMap<EntityConfig, EntityConfigDto>()
                .ForMember(e => e.Suppress, c => c.MapFrom(e => e.Suppress))
                .ForMember(e => e.Name, c => c.MapFrom(e => e.Name))

                .ForMember(e => e.Label, c => c.MapFrom(e => e.Revision != null ? e.Revision.Label : null))
                .ForMember(e => e.Description, c => c.MapFrom(e => e.Revision != null ? e.Revision.Description : null))
                .ForMember(e => e.Module, c => c.MapFrom(e => e.Module != null ? e.Module.Name : ""))
                .ForMember(e => e.ModuleId, c => c.MapFrom(e => e.Module != null ? e.Module.Id : Guid.Empty))
                ;

            CreateMap<EntityPropertyDto, EntityProperty>();
            CreateMap<EntityProperty, EntityPropertyDto>()
                .ForMember(e => e.EntityConfigName, c => c.MapFrom(e => e.EntityConfigRevision.FullClassName));

            CreateMap<EntityProperty, ModelPropertyDto>()
                .ForMember(e => e.Properties, c => c.MapFrom(e => e.Properties.OrderBy(p => p.SortOrder).ToList()));

            CreateMap<EntityConfig, ModelConfigurationDto>()
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

                .ForMember(e => e.Label, m => m.MapFrom(e => e.LatestRevision.Label))
                .ForMember(e => e.Description, m => m.MapFrom(e => e.LatestRevision.Description))
                .ForMember(e => e.NotImplemented, c => c.MapFrom(e => e.LatestRevision.Source == MetadataSourceType.ApplicationCode
                        && StaticContext.IocManager.Resolve<EntityConfigurationStore>().GetOrNull(e.LatestRevision.FullClassName) == null))
                .ForMember(e => e.AllowConfigureAppService, c => c.MapFrom(e => e.LatestRevision.Source == MetadataSourceType.ApplicationCode 
                        && AllowConfigureAppService(e)))
                ;

            CreateMap<ModelPropertyDto, PropertyMetadataDto>()
                .ForMember(e => e.Path, c => c.MapFrom(e => e.Name))
                .ForMember(e => e.IsVisible, c => c.MapFrom(e => !e.Suppress))
                .ForMember(e => e.OrderIndex, c => c.MapFrom(e => e.SortOrder ?? 0))
                .ForMember(e => e.EntityType, c => c.MapFrom(e => e.EntityType))
                .ForMember(e => e.EntityModule, c => c.MapFrom(e => e.EntityModule))
                ;
        }

        private bool AllowConfigureAppService(EntityConfig entityConfig)
        {
            var attr = StaticContext.IocManager.Resolve<EntityConfigurationStore>().GetOrNull(entityConfig.LatestRevision.FullClassName)?.EntityType?.GetAttributeOrNull<EntityAttribute>();
            return attr == null || attr.GenerateApplicationService == GenerateApplicationServiceState.UseConfiguration;
        }
    }
}