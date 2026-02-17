using Abp.Application.Services.Dto;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Dto.Interfaces;
using Shesha.DynamicEntities.Enums;
using Shesha.Permissions;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.DynamicEntities.Dtos
{
    /// <summary>
    /// Model configuration DTO
    /// </summary>
    public class ModelConfigurationDto : EntityDto<Guid>, IConfigurationItemDto
    {
        public bool CreatedInDb { get; set; }

        public EntityInitFlags? InitStatus { get; set; }
        public string? InitMessage { get; set; }

        public string? DiscriminatorValue { get; set; }
        
        public string? SchemaName { get; set; }
        public string? TableName { get; set; }

        public Guid? InheritedFromId { get; set; }
        public string? InheritedFromClassName { get; set; }
        public string? InheritedFromNamespace { get; set; }

        public bool IsExposed { get; set; }

        public string ClassName { get; set; }
        public string? Namespace { get; set; }

        public bool GenerateAppService { get; set; }

        public bool AllowConfigureAppService { get; set; }

        public List<ModelPropertyDto> Properties { get; set; } = new List<ModelPropertyDto>();

        public string? HardcodedPropertiesMD5 { get; set; }
        public DateTime ChangeTime { get; set; }

        // ConfigurationItem
        public Guid? FolderId { get; set; }

        public Guid? ModuleId { get; set; }
        public string? Module { get; set; }
        public string Name { get; set; }
        public string? Label { get; set; }
        public string? Description { get; set; }
        public bool Suppress { get; set; }
        public bool NotImplemented { get; set; }

        /// <summary>
        /// Source of the entity (code/user)
        /// </summary>
        public MetadataSourceType? Source { get; set; }

        public virtual EntityConfigTypes? EntityConfigType { get; set; }

        // Permissions
        public PermissionedObjectDto? Permission { get; set; }
        public PermissionedObjectDto? PermissionGet { get; set; }
        public PermissionedObjectDto? PermissionCreate { get; set; }
        public PermissionedObjectDto? PermissionUpdate { get; set; }
        public PermissionedObjectDto? PermissionDelete { get; set; }

        public List<EntityViewConfigurationDto> ViewConfigurations { get; set; } = new List<EntityViewConfigurationDto>();

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

            if (model.ViewConfigurations != null)
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
    }
}
