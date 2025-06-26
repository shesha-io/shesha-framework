using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Framework.Note")]
    public class Note : FullPowerChildEntity
    {
        [StringLength(50)]
        public virtual string? Category { get; set; }

        public virtual Note Parent { get; set; }

        [StringLength(int.MaxValue, MinimumLength = 3)]
        public virtual string NoteText { get; set; }

        public virtual Person Author { get; set; }
        public virtual bool HasAttachment { get; set; }

        public virtual RefListVisibilityType VisibilityType { get; set; }
    }
}
