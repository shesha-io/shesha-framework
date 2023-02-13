using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Framework.Note")]
    public class Note : FullPowerChildEntity
    {
        [ReferenceList("Shesha", "NoteType")]
        public virtual int? Category { get; set; }

        [ReferenceList("Shesha", "NotePriority")]
        public virtual int? Priority { get; set; }

        public virtual Note Parent { get; set; }

        [StringLength(int.MaxValue, MinimumLength = 3)]
        public virtual string NoteText { get; set; }

        public virtual Person Author { get; set; }
    }
}
