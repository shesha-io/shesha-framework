using Shesha.DynamicEntities;
using Shouldly;
using Xunit;

namespace Shesha.Tests.DynamicEntities
{
    public class DynamicDtoTypeBuildingContext_Tests
    {
        [Fact]
        public void NamePrefixSequence_Test()
        {
            var context = new DynamicDtoTypeBuildingContext();

            context.CurrentPrefix.ShouldBeEmpty();

            const string level1 = "1-level";
            const string level2 = "2-level";
            const string level3 = "3-level";

            using (context.OpenNamePrefix(level1))
            {
                context.CurrentPrefix.ShouldBe(level1);

                using (context.OpenNamePrefix(level2))
                {
                    context.CurrentPrefix.ShouldBe($"{level1}.{level2}");

                    using (context.OpenNamePrefix(level3))
                    {
                        context.CurrentPrefix.ShouldBe($"{level1}.{level2}.{level3}");
                    }

                    context.CurrentPrefix.ShouldBe($"{level1}.{level2}");
                }

                context.CurrentPrefix.ShouldBe(level1);
            }

            context.CurrentPrefix.ShouldBeEmpty();
        }
    }
}
