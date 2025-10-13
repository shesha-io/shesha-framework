using System;
using System.ComponentModel.DataAnnotations;
using Abp.Application.Services.Dto;

namespace Shesha.Notes.Dto
{
    public class UpdateNoteDto : EntityDto<Guid>
    {
        /// <summary>
        /// Category of the note. Is used to split notes into groups
        /// </summary>
        public string? Category { get; set; }

        /// <summary>
        /// Note importance (priority)
        /// </summary>
        public int? Priority { get; set; }

        /// <summary>
        /// Id of the parent note
        /// </summary>
        public Guid? ParentId { get; set; }

        /// <summary>
        /// Text
        /// </summary>
        [Required]
        public string NoteText { get; set; }
    }
}
