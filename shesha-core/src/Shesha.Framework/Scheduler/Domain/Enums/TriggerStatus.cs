using Shesha.Domain.Attributes;

namespace Shesha.Scheduler.Domain.Enums
{
    [ReferenceList("Shesha.Scheduler", "TriggerStatus")]
    public enum TriggerStatus
    {
        Enabled = 1,
        Disabled = 2
    }
}
