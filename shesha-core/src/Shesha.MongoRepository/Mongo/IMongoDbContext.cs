using MongoDB.Driver;

namespace Shesha.MongoRepository.Mongo
{
    public interface IMongoDbContext
    {
        string ConnectionString { get; }
        string DatabaseName { get; }
        bool PluralizeDocumentName { get; set; }
        IMongoCollection<T> Collection<T>() where T : MongoEntity;
        void Drop<T>() where T : MongoEntity;
    }
}