using Abp.Application.Services.Dto;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Dto.Interfaces;
using System;
using System.Collections.Generic;

namespace Shesha.Web.FormsDesigner.Dtos
{
    /// <summary>
    /// Form configuration DTO
    /// </summary>
    public class FormConfigurationDto: EntityDto<Guid>, IConfigurationItemDto
    {
        /// <summary>
        /// Module Id
        /// </summary>
        public Guid? ModuleId { get; set; }

        /// <summary>
        /// Origin id
        /// </summary>
        public Guid? OriginId { get; set; }

        /// <summary>
        /// Module name
        /// </summary>
        public string? Module { get; set; }

        /// <summary>
        /// Form name
        /// </summary>
        public required string Name { get; set; }

        /// <summary>
        /// Label
        /// </summary>
        public string? Label { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Markup in JSON format
        /// </summary>
        public string? Markup { get; set; }

        /// <summary>
        /// Type of the form model
        /// </summary>
        public string? ModelType { get; set; }

        public bool Suppress { get; set; }

        public RefListPermissionedAccess? Access { get; set; }

        public List<string>? Permissions { get; set; }

        /// <summary>
        /// 
        /// </summary>
        public virtual Guid? TemplateId { get; set; }

        /// <summary>
        /// Form for getting additional configuration options for template
        /// </summary>
        public FormIdentifier? ConfigurationForm { get; set; }

        /// <summary>
        /// The fully qualified name of the class implementing the generation behavior for this template through ITemplateGenerator
        /// </summary>
        public string GenerationLogicTypeName { get; set; }

        /// <summary>
        /// 
        /// </summary>
        public string GenerationLogicExtensionJson { get; set; }

        /// <summary>
        /// 
        /// </summary>
        public string PlaceholderIcon { get; set; }
    }
}
