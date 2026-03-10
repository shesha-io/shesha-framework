using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Dto.Interfaces
{
    public interface IConfigurationItemDto
    {
        /// <summary>
        /// Configuration Item Id
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Module Id
        /// </summary>
        public Guid? ModuleId { get; set; }

        /// <summary>
        /// Module name
        /// </summary>
        public string? Module { get; set; }

        /// <summary>
        /// Item name
        /// </summary>
        [MaxLength(200)]
        [Display(Name = "Name", Description = "Name of the configuration item. Unique within the module.")]
        string Name { get; set; }

        /// <summary>
        /// Label of the con
        /// </summary>
        [MaxLength(200)]
        [Display(Name = "Label", Description = "Label of the item, can be used in lists as a user friendly name")]
        string? Label { get; set; }

        /// <summary>
        /// Item description
        /// </summary>
        [MaxLength(int.MaxValue)]
        [DataType(DataType.MultilineText)]
        string? Description { get; set; }

        /// <summary>
        /// If true, it means that the item will not be visible to Config or End-users/Admins.
        /// </summary>
        [Display(Name = "Suppress", Description = "If true, it means that the item will not be visible to Config or End-users/Admins.")] 
        bool Suppress { get; set; }
    }
}
