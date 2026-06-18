using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace Shesha.MongoRepository.Mongo
{
    public interface IMongoRepository<T> where T : MongoEntity
    {
        IMongoDbContext Context { get; }
        IQueryable<T> Table { get; }
        int Count { get; }
        void Insert(T entity);
        void Insert(IEnumerable<T> entities);
        void Update(T entity);
        void Update(IEnumerable<T> entities);
        void Delete(T entity);
        void Delete(IEnumerable<T> entities);
        T Find(object Id);
        T Find(Expression<Func<T, bool>> filter);
        IEnumerable<T> Get(Expression<Func<T, bool>> filter);
    }
}
