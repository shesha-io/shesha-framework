namespace Shesha.FluentMigrator
{
    /// <summary>
    /// Common exceptions class for Shesha migrations
    /// </summary>
    public class SheshaMigrationException: Exception
    {
        public SheshaMigrationException(string? message): base(message)
        {

        }
    }
}
