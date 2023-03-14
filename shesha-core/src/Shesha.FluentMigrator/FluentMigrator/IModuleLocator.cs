namespace Shesha.FluentMigrator
{
    /// <summary>
    /// Configurable module locator. Is used as an abstraction level 
    /// </summary>
    public interface IModuleLocator
    {
        /// <summary>
        /// Return name of the configurable module specified <paramref name="migrationType"/> belongs to
        /// </summary>
        /// <param name="migrationType"></param>
        /// <returns></returns>
        string GetModuleName(Type migrationType);
    }
}
