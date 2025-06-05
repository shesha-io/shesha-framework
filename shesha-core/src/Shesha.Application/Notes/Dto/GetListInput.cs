using System.ComponentModel.DataAnnotations;

namespace Shesha.Notes.Dto
{
    public class GetListInput
    {
        /// <summary>
        /// Id of the owner entity
        /// </summary>
        [Required]
        public string OwnerId { get; set; }

        /// <summary>
        /// Type short alias of the owner entity
        /// </summary>
        [Required]
        public string OwnerType { get; set; }

        /// <summary>
        /// Category of the note. Is used to split notes into groups
        /// </summary>
        public string? Category { get; set; }

        /// <summary>
        /// Set to true to get notes of all categories
        /// </summary>
        public bool AllCategories { get; set; }
    }
}
