using System.Threading.Tasks;

namespace Shesha.HealthChecks
{
    /// <summary>
    /// Confirms the database is reachable; completes on success, faults on failure.
    /// </summary>
    public interface IPersonReadinessProbe
    {
        // No CancellationToken: the probe is shared, so one caller dropping its request must not
        // kill another caller's probe - and the connection open it blocks in ignores tokens anyway.
        Task ProbeAsync();
    }
}
