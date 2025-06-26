using Abp;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Linq;
using Abp.Timing;
using Newtonsoft.Json.Linq;
using Shesha.JsonLogic;
using Shesha.Reflection;
using Shesha.Tests.Fixtures;
using Shesha.Tests.TestingUtils;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.JsonLogic
{
    /// <summary>
    /// Base class of tests <see cref="JsonLogic2LinqConverter"/>
    /// </summary>
    public abstract class JsonLogic2LinqConverterBaseTests : SheshaNhTestBase
    {
        protected JsonLogic2LinqConverterBaseTests(IDatabaseFixture fixture) : base(fixture)
        {
        }

        protected Expression<Func<T, bool>>? ConvertToExpression<T>(string jsonLogicExpression)
        {
            var converter = Resolve<IJsonLogic2LinqConverter>();

            // Parse json into hierarchical structure
            var jsonLogic = JObject.Parse(jsonLogicExpression);

            var expression = converter.ParseExpressionOf<T>(jsonLogic);
            return expression;
        }

        protected async Task<List<T>> TryFetchDataAsync<T, TId>(string jsonLogicExpression, Func<IQueryable<T>, IQueryable<T>>? prepareQueryable = null, Action<List<T>>? assertions = null) where T : class, IEntity<TId>
        {
            var expression = ConvertToExpression<T>(jsonLogicExpression).NotNull();

            var repository = LocalIocManager.Resolve<IRepository<T, TId>>();
            var asyncExecuter = LocalIocManager.Resolve<IAsyncQueryableExecuter>();

            return await WithUnitOfWorkAsync(async () => {
                var query = repository.GetAll().Where(expression);

                if (prepareQueryable != null)
                    query = prepareQueryable.Invoke(query);

                var data = await asyncExecuter.ToListAsync(query);

                assertions?.Invoke(data);

                return data;
            });
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

        protected override void PreInitialize()
        {
            base.PreInitialize();
            Thread.CurrentThread.CurrentCulture = CultureInfo.InvariantCulture;
        }

        public override void Dispose()
        {

            base.Dispose();
        }
    }
}
