using Shesha.Domain.Attributes;

namespace Shesha.Scheduler.Domain.Enums
{
    [ReferenceList("Shesha.Scheduler", "LogMode")]
    public enum LogMode
    {
        FileSystem = 1,
        StoredFile = 2
    }
}
