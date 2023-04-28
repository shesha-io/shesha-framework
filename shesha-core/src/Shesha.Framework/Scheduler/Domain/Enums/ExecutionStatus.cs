using Shesha.Domain.Attributes;

namespace Shesha.Scheduler.Domain.Enums
{
    [ReferenceList("Shesha.Scheduler", "ExecutionStatus")]
    public enum ExecutionStatus
    {
        InProgress = 1,
        Completed = 2,
        Failed = 3,
        Enqueued = 4,
    }
}
