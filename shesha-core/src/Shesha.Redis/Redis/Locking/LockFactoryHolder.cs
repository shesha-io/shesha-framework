namespace Shesha.Redis.Locking
{
    public class LockFactoryHolder : IDisposable, ILockFactoryHolder
    {
        private RedisLockFactory? _lockFactory;

        public RedisLockFactory? LockFactory => _lockFactory;

        public void CreateLockFactory(string connectionString, int? databaseId)
        {
            if (_lockFactory != null)
                throw new Exception("Lock factory already created");

            _lockFactory = new RedisLockFactory(connectionString, databaseId);
        }

        public void Dispose()
        {
            _lockFactory?.Dispose();
        }
    }
}
