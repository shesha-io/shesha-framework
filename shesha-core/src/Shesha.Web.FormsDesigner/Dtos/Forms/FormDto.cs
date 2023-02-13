using Abp.Application.Services.Dto;
using System;

namespace Shesha.Web.FormsDesigner.Dtos
{
    /// <summary>
    /// Form DTO
    /// </summary>
    public class FormDto: EntityDto<Guid>
    {
        /// <summary>
        /// Form path/id is used to identify a form
        /// </summary>
        public string Path { get; set; }

        /// <summary>
        /// Form name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Form markup (components) in JSON format
        /// </summary>
        public string Markup { get; set; }

        /// <summary>
        /// Type of the form model
        /// </summary>
        public string ModelType { get; set; }

        /// <summary>
        /// Type
        /// </summary>
        public string Type { get; set; }
    }
}
