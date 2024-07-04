using Abp;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Linq;
using Abp.Timing;
using Newtonsoft.Json.Linq;
using Shesha.JsonLogic;
using Shesha.Tests.TestingUtils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace Shesha.Tests.JsonLogic
{
    /// <summary>
    /// Base class of tests <see cref="JsonLogic2LinqConverter"/>
    /// </summary>
    public abstract class JsonLogic2LinqConverterBaseTests: SheshaNhTestBase
    {
        protected Expression<Func<T, bool>> ConvertToExpression<T>(string jsonLogicExpression)
        {
            var converter = Resolve<IJsonLogic2LinqConverter>();

            // Parse json into hierarchical structure
            var jsonLogic = JObject.Parse(jsonLogicExpression);

            var expression = converter.ParseExpressionOf<T>(jsonLogic);
            return expression;
        }

        protected async Task<List<T>> TryFetchData<T, TId>(string jsonLogicExpression, Func<IQueryable<T>, IQueryable<T>> prepareQueryable = null, Action<List<T>> assertions = null) where T : class, IEntity<TId>
        {
            var expression = ConvertToExpression<T>(jsonLogicExpression);

            var repository = LocalIocManager.Resolve<IRepository<T, TId>>();
            var asyncExecuter = LocalIocManager.Resolve<IAsyncQueryableExecuter>();

            List<T> data = null;

            await WithUnitOfWorkAsync(async () => {
                var query = repository.GetAll().Where(expression);

                if (prepareQueryable != null)
                    query = prepareQueryable.Invoke(query);

                data = await asyncExecuter.ToListAsync(query);

                assertions?.Invoke(data);
            });

            return data;
        }

        protected IDisposable FreezeTime()
        {
            // save current provider
            var prevProvider = Clock.Provider;

            // change current provider to static
            Clock.Provider = new StaticClockProvider();

            // return compensation logic
            return new DisposeAction(() => {
                Clock.Provider = prevProvider;
            });
        }
    }
}
