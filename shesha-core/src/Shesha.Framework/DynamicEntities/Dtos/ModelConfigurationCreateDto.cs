using Abp.Application.Services.Dto;
using Shesha.Domain;
using Shesha.Domain.Enums;
using System;
using System.Collections.Generic;

namespace Shesha.DynamicEntities.Dtos
{
    /// <summary>
    /// Create model configuration DTO
    /// </summary>
    public class ModelConfigurationCreateDto : EntityDto<Guid?>
    {
        public EntityConfigTypes EntityConfigType { get; set; }

        public EntityTypeIdentifier? InheritedFromId { get; set; }
        public string? InheritedFromClassName { get; set; }
        public string? InheritedFromNamespace { get; set; }

        // ConfigurationItem        
        public Guid? ModuleId { get; set; }
        public string? Module { get; set; }
        public string Name { get; set; }
        public string? Label { get; set; }
        public string? Description { get; set; }

        // ToDo: AS - Remove after make create modal form
        public List<ModelPropertyDto> Properties { get; set; } = new List<ModelPropertyDto>();
        public List<EntityViewConfigurationDto> ViewConfigurations { get; set; } = new List<EntityViewConfigurationDto>();

        //public string ClassName { get; set; }
        //public string Namespace { get; set; }
        //public bool GenerateAppService { get; set; }
        //public bool AllowConfigureAppService { get; set; }
        //public string? HardcodedPropertiesMD5 { get; set; }
        //public DateTime ChangeTime { get; set; }
        //public int VersionNo { get; set; }
        //public ConfigurationItemVersionStatus VersionStatus { get; set; }
        //public bool Suppress { get; set; }
        //public bool NotImplemented { get; set; }

        //public MetadataSourceType? Source { get; set; }

        //public virtual EntityConfigTypes? EntityConfigType { get; set; }

        //// Permissions
        //public PermissionedObjectDto? Permission { get; set; }
        //public PermissionedObjectDto? PermissionGet { get; set; }
        //public PermissionedObjectDto? PermissionCreate { get; set; }
        //public PermissionedObjectDto? PermissionUpdate { get; set; }
        //public PermissionedObjectDto? PermissionDelete { get; set; }

        /*
        public void NormalizeViewConfigurations(EntityConfig model)
        {
            var list = new List<EntityViewConfigurationDto>();
            if (model.EntityConfigType == EntityConfigTypes.Class)
                list.AddRange(new List<EntityViewConfigurationDto>()
                {
                    new EntityViewConfigurationDto { IsStandard = true, Type = "Table", FormId = null },
                    new EntityViewConfigurationDto { IsStandard = true, Type = "Picker", FormId = null }
                });

            list.AddRange(new List<EntityViewConfigurationDto>()
            {
                new EntityViewConfigurationDto { IsStandard = true, Type = "Details", FormId = null },
                new EntityViewConfigurationDto { IsStandard = true, Type = "Create", FormId = null },
                new EntityViewConfigurationDto { IsStandard = true, Type = "Edit", FormId = null },
                new EntityViewConfigurationDto { IsStandard = true, Type = "Quickview", FormId = null },
                new EntityViewConfigurationDto { IsStandard = true, Type = "List item", FormId = null },
            });

            if (model?.ViewConfigurations != null)
            {
                foreach (var view in model.ViewConfigurations)
                {
                    var vc = list.FirstOrDefault(x => x.Type == view.Type);
                    if (vc != null)
                        vc.FormId = view.FormId;
                    else
                        list.Add(view);
                }
            }
            ViewConfigurations = list;
        }
        */
    }
}
