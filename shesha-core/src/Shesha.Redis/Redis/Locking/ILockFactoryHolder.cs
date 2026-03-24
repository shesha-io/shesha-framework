namespace Shesha.Redis.Locking
{
    /// <summary>
    /// Redis lock factory holder
    /// </summary>
    public interface ILockFactoryHolder
    {
        /// <summary>
        /// Lock factory
        /// </summary>
        public RedisLockFactory? LockFactory { get; }

        /// <summary>
        /// Create lock factory
        /// </summary>
        public void CreateLockFactory(string connectionString, int? databaseId);
    }
}
