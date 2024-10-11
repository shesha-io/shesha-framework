namespace Shesha.Startup
{
    /// <summary>
    /// Arguments of the application start logging
    /// </summary>
    public class LogApplicationStartArgs
    {
        public bool BootstrappersDisabled { get; set; }
        public bool MigrationsDisabled { get; set; }
    }
}
