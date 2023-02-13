using System;

namespace Shesha.Areas.Dto
{
    public class MoveAreaInput
    {
        public Guid Id { get; set; }
        public Guid? NewParentId { get; set; }
    }
}
