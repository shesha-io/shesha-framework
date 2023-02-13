using Abp.Reflection;
using Shesha.Extensions;
using Shesha.Services;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Linq;
using Xunit;

namespace Shesha.Tests.DomainModel
{
    public class DomainModel_Tests : SheshaNhTestBase
    {
        public DomainModel_Tests()
        {
            
        }

        [Fact]
        public void EntitiesRead_Test()
        {
            var typeFinder = StaticContext.IocManager.Resolve<ITypeFinder>();
            
            var types = typeFinder.FindAll().Where(t => t.IsEntityType() && !t.Assembly.FullName.StartsWith("Abp")).ToList();

            var errors = new Dictionary<Type, Exception>();

            UsingDbSession(session =>
            {
                foreach (var type in types)
                {
                    try
                    {
                        var hql = $"select Id from {type.FullName}";
                        var list = session.CreateQuery(hql).SetMaxResults(1).List();
                    }
                    catch (Exception e)
                    {
                        errors.Add(type, e);
                    }
                }
            });

            // Assert
            errors.Any().ShouldBe(false);
        }
    }
}
