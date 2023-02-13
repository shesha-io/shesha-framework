using System;
using System.Threading;
using System.Threading.Tasks;
using Abp.Domain.Entities;
using NHibernate.Engine;
using NHibernate.Id;

namespace Shesha.NHibernate.Generators
{
    public class GuidAssignedGenerator : IIdentifierGenerator
    {
        public Task<object> GenerateAsync(ISessionImplementor session, object obj, CancellationToken cancellationToken)
        {
            return Task.FromResult(DoGenerate(session, obj));
        }

        public object Generate(ISessionImplementor session, object obj)
        {
            return DoGenerate(session, obj);
        }

        private object DoGenerate(ISessionImplementor session, object obj)
        {
            if (obj is IEntity<Guid> entity && entity.Id != Guid.Empty)
                return entity.Id;

            return Guid.NewGuid();
        }
    }
}
