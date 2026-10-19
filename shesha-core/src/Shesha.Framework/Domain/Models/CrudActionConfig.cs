using Shesha.Domain.Enums;
using Shesha.Domain.Interfaces;

namespace Shesha.Domain
{
    public class CrudActionConfig : ICrudActionConfig
    {
        public CrudActionsAccess CrudActionsAccess { get; set; }

        public string[] CrudActionsPermissions { get; set; }
    }
}
