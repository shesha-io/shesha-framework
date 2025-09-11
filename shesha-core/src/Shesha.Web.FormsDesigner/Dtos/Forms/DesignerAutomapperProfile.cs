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
                .ForMember(e => e.VersionNo, m => m.MapFrom(e => e.LatestRevision != null ? e.LatestRevision.VersionNo : 0))

                .ForMember(e => e.Suppress, m => m.MapFrom(e => e.Suppress))
                .ForMember(e => e.Label, m => m.MapFrom(e => e.Revision.Label))
                .ForMember(e => e.Description, m => m.MapFrom(e => e.Revision.Description))
                .ForMember(e => e.ModelType, m => m.MapFrom(e => e.Revision.ModelType))
                .ForMember(e => e.Markup, m => m.MapFrom(e => e.Revision.Markup))
                .ForMember(e => e.ConfigurationForm, m => m.MapFrom(e => e.Revision.ConfigurationForm))
                .ForMember(e => e.TemplateId, m => m.MapFrom(e => e.Revision.Template != null ? e.Revision.Template.Id : (Guid?)null))
                .ForMember(e => e.GenerationLogicTypeName, m => m.MapFrom(e => e.Revision.GenerationLogicTypeName))
                .ForMember(e => e.GenerationLogicExtensionJson, m => m.MapFrom(e => e.Revision.GenerationLogicExtensionJson))
                .ForMember(e => e.PlaceholderIcon, m => m.MapFrom(e => e.Revision.PlaceholderIcon));
        }
    }
}
