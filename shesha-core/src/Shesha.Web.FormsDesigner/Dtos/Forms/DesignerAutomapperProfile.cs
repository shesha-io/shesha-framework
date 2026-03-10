using Shesha.AutoMapper;
using Shesha.Domain;
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
            CreateMap<FormConfiguration, FormConfigurationDto>()
                .ForMember(e => e.ModuleId, m => m.MapFrom(e => e.Module != null ? e.Module.Id : (Guid?)null))
                .ForMember(e => e.OriginId, m => m.MapFrom(e => e.Origin != null ? e.Origin.Id : (Guid?)null))
                .ForMember(e => e.Module, m => m.MapFrom(e => e.Module != null ? e.Module.Name : null))
                .ForMember(e => e.Name, m => m.MapFrom(e => e.Name))
                .ForMember(e => e.Suppress, m => m.MapFrom(e => e.Suppress))
                .ForMember(e => e.Label, m => m.MapFrom(e => e.Label))
                .ForMember(e => e.Description, m => m.MapFrom(e => e.Description))
                .ForMember(e => e.ModelType, m => m.MapFrom(e => e.ModelType))
                .ForMember(e => e.Markup, m => m.MapFrom(e => e.Markup))
                .ForMember(e => e.ConfigurationForm, m => m.MapFrom(e => e.ConfigurationForm))
                .ForMember(e => e.TemplateId, m => m.MapFrom(e => e.Template != null ? e.Template.Id : (Guid?)null))
                .ForMember(e => e.GenerationLogicTypeName, m => m.MapFrom(e => e.GenerationLogicTypeName))
                .ForMember(e => e.GenerationLogicExtensionJson, m => m.MapFrom(e => e.GenerationLogicExtensionJson))
                .ForMember(e => e.PlaceholderIcon, m => m.MapFrom(e => e.PlaceholderIcon));
        }
    }
}
