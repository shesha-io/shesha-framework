using Abp.Domain.Entities;
using Boxfusion.SheshaFunctionalTests.Common.Domain.Domain.Enum;
using Shesha.Domain.Attributes;
using Shesha.EntityReferences;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    [Table("SheshaFunctionalTests_TestClasses")]
    [Entity(TypeShortAlias = "Boxfusion.SheshaFunctionalTests.Domain.TestClass")]
    public class TestClass: Entity<Guid>
    {
        /// <summary>
        /// 
        /// </summary>
        public virtual string TestProp { get; set; }

        public virtual TestJsonEntity JsonProp { get; set; }

        [ReferenceList("Boxfusion.SheshaFunctionalTests.Domain.Enum", "TestItem")]
        public virtual RefListTestItem? ReflistProp { get; set; }

        [EntityReference(true)]
        public virtual GenericEntityReference SomeGenericProp { get; set; }

        public virtual JsonAddress SomeJsonAddressProp { get; set; }

    }
}
