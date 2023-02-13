using Shesha.AutoMapper;
using Shesha.Web.FormsDesigner.Domain;
using System;

namespace Shesha.Web.FormsDesigner.Dtos
{
    /// <summary>
    /// Form Designer Automapper profile
    /// </summary>
    public class DesignerAutomapperProfile: ShaProfile
    {
        public DesignerAutomapperProfile()
        {
            CreateMap<ConfigurableComponent, ConfigurableComponentDto>()
                .ForMember(e => e.Name, m => m.MapFrom(e => e.Configuration.Name))
                .ForMember(e => e.Description, m => m.MapFrom(e => e.Configuration.Description));

            CreateMap<ConfigurableComponentDto, ConfigurableComponent>();
            CreateMap<ConfigurableComponentUpdateSettingsInput, ConfigurableComponent>();

            //
            CreateMap<FormConfiguration, FormConfigurationDto>()
                .ForMember(e => e.ModuleId, m => m.MapFrom(e => e.Configuration.Module != null ? e.Configuration.Module.Id : (Guid?)null))
                .ForMember(e => e.OriginId, m => m.MapFrom(e => e.Configuration.Origin != null ? e.Configuration.Origin.Id : (Guid?)null))
                .ForMember(e => e.Module, m => m.MapFrom(e => e.Configuration.Module != null ? e.Configuration.Module.Name: null))
                .ForMember(e => e.IsLastVersion, m => m.MapFrom(e => e.Configuration != null ? e.Configuration.IsLast : false))
                .ForMember(e => e.Name, m => m.MapFrom(e => e.Configuration.Name))
                .ForMember(e => e.Label, m => m.MapFrom(e => e.Configuration.Label))
                .ForMember(e => e.Description, m => m.MapFrom(e => e.Configuration.Description))
                .ForMember(e => e.VersionNo, m => m.MapFrom(e => e.Configuration.VersionNo))
                .ForMember(e => e.VersionStatus, m => m.MapFrom(e => e.Configuration.VersionStatus))
                .ForMember(e => e.Suppress, m => m.MapFrom(e => e.Configuration.Suppress))
                .ForMember(e => e.ModelType, m => m.MapFrom(e => e.ModelType))
                .ForMember(e => e.Markup, m => m.MapFrom(e => e.Markup));
        }
    }
}
