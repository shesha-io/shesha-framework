using MongoDB.Driver;
using PluralizeService.Core;
using Shesha.MongoRepository.Mongo;
using System;

namespace MongoDbRepository
{
    public sealed class MongoDbContext : IMongoDbContext
    {
        private bool disposed;

        /// <summary>
        /// Get connection string from Mongo Client
        /// </summary>
        public string ConnectionString { get; private set; }

        /// <summary>
        /// Get database name from Mongo Client
        /// </summary>
        public string DatabaseName { get; private set; }

        /// <summary>
        /// Pluralize document name on server
        /// Default value = false
        /// </summary>
        public bool PluralizeDocumentName { get; set; }

        private IMongoClient client;
        private IMongoDatabase database;

        public MongoDbContext(string connectionString)
        {
            ConnectionString = connectionString;
            DatabaseName = MongoUrl.Create(ConnectionString).DatabaseName;
            client = new MongoClient(ConnectionString);
            database = client.GetDatabase(DatabaseName);
        }

        public IMongoCollection<T> Collection<T>() where T : MongoEntity
        {
            //Pluralize class name
            string tableName = PluralizeDocumentName ? PluralizationProvider.Pluralize(typeof(T).Name) : typeof(T).Name;

            return database.GetCollection<T>(tableName);
        }

        public void Drop<T>() where T : MongoEntity
        {
            //Pluralize class name
            string tableName = PluralizeDocumentName ? PluralizationProvider.Pluralize(typeof(T).Name) : typeof(T).Name;

             database.DropCollection(tableName);
        }

        public void Dispose()
        {
            if (disposed)
                return;

            client?.Dispose();

            disposed = true;
        }

        private void ThrowIfDisposed()
        {
            if (disposed)
            {
                throw new ObjectDisposedException(GetType().FullName);
            }
        }
    }
}