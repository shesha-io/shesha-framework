using Abp.Domain.Entities;
using Boxfusion.SheshaFunctionalTests.Common.Domain.Domain.Enum;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.EntityReferences;
using Shesha.JsonEntities;
using System;
using System.Collections;
using System.Collections.Generic;
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
        /// <summary>
        /// 
        /// </summary>
        public virtual JsonEntity JsonProp { get; set; }
        /// <summary>
        /// 
        /// </summary>
        [SaveAsJson]
        public virtual IList<JsonEntity> TestListOfJsonEntitiesProp { get; set; }
        /// <summary>
        /// 
        /// </summary>
        [SaveAsJson]
        public virtual IList<JsonHouse> TestListOfJsonHouses { get; set; }
        /// <summary>
        /// 
        /// </summary>
        [ReferenceList("Boxfusion.SheshaFunctionalTests.Domain.Enum", "TestItem")]
        public virtual RefListTestItem? ReflistProp { get; set; }
        /// <summary>
        /// 
        /// </summary>
        [EntityReference(true)]
        public virtual GenericEntityReference SomeGenericProp { get; set; }
    }

    public class TestJsonWithGenericEntityReference: JsonEntity
    {
        public virtual GenericEntityReference Entity { get; set; }
    }
}
