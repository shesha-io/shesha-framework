namespace Shesha.BackgroundProcesses.Models
{
    /// <summary>
    /// Process status (e.g. running, completed, failed)
    /// </summary>
    public enum ProcessStatus
    {
        Unknown = 0,
        Idle = 1,
        Running = 2,
        Completed = 3,
        Failed = 4,
        Cancelled = 5,
    }
}
