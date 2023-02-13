using System;

namespace Shesha.Services.ReferenceLists.Dto
{
    /// <summary>
    /// DTO that is used for Reference List creation
    /// </summary>
    public class CreateReferenceListDto
    {
        /// <summary>
        /// Module id
        /// </summary>
        public Guid? ModuleId { get; set; }

        /// <summary>
        /// Reference list name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Label
        /// </summary>
        public string Label { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }
    }
}
