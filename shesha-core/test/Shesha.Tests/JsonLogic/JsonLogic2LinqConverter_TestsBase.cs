using Abp;
using Abp.Timing;
using Moq;
using Newtonsoft.Json.Linq;
using Shesha.Enterprise.Tests.Fixtures;
using Shesha.JsonLogic;
using Shesha.Specifications;
using Shesha.Tests.TestingUtils;
using System;
using System.Globalization;
using System.Linq.Expressions;
using System.Threading;

namespace Shesha.Tests.JsonLogic
{
    public abstract class JsonLogic2LinqConverter_TestsBase: FrameworkTestBase
    {
        public JsonLogic2LinqConverter_TestsBase(IDatabaseFixture fixture) : base(fixture)
        {
        }

        protected Expression<Func<T, bool>>? ConvertToExpression<T>(string jsonLogicExpression)
        {
            var specificationsFinder = new Mock<ISpecificationsFinder>();
            var specificationsManager = new Mock<ISpecificationManager>();

            var converter = Resolve<JsonLogic2LinqConverter>(new 
                { 
                    specificationsFinder = specificationsFinder.Object, 
                    specificationsManager = specificationsManager.Object,
            }
            );

            // Parse json into hierarchical structure
            var jsonLogic = JObject.Parse(jsonLogicExpression);

            var expression = converter.ParseExpressionOf<T>(jsonLogic);
            return expression;
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
