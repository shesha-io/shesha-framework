namespace Shesha.NHibernate.DbHealth
{
    /// <summary>
    /// Arguments of check health action
    /// </summary>
    public class CheckHealthArguments
    {
        public DbmsType DatabaseType { get; init; }
    }
}
