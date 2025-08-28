using Abp.Domain.Entities;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.JsonEntities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    public class DynamicObject
    {
        public string Name { get; set; }

        public string Description { get; set; }

        public FormIdentifier FormIdFullName { get; set; }
    }

    public class JsonObject: JsonEntity
    {
        public string Subject { get; set; }
    }

    public class JsonArticle : JsonObject
    {
        public string Body { get; set; }
    }

    public class JsonBook : JsonObject
    {
        public string Title { get; set; }

        public DynamicPerson Author { get; set; }

        public JsonArticle Article { get; set; }
    }

    [Table("Test_DynamicTest")]
    [Discriminator]
    [DiscriminatorValue("SheshaFunctionalTests.DynamicTest")]
    public class DynamicTestApp : Entity<Guid>
    {
        [EntityDisplayName]
        public virtual string? String { get; set; }

        public virtual DateTime? DateTime { get; set; }

        public virtual int? Integer { get; set; }
        public virtual float? Float { get; set; }
        public virtual decimal? Decimal { get; set; }

        public virtual DynamicTestApp? Parent { get; set; }

        public virtual StoredFile File { get; set; }

        //[ManyToMany(true)]
        //public virtual IList<Person> Persons { get; set; } = new List<Person>();

        [DynamicManyToOne(nameof(Parent))]
        public virtual IList<DynamicTestApp> Children { get; set; } = new List<DynamicTestApp>();

        // JSON

        public virtual JsonEntity AnyJsonEntity { get; set; }

        public virtual JsonObject JsonObject { get; set; }

        [SaveAsJson]
        public virtual DynamicObject DynamicObject { get; set; }

        [SaveAsJson]
        public virtual DynamicObject DynamicObjectTwo { get; set; }

        [SaveAsJson]
        public virtual object AnyObject { get; set; }

        [SaveAsJson]
        public virtual IList<JsonEntity> JsonEntities { get; set; } = new List<JsonEntity>();

        [SaveAsJson]
        public virtual IList<DynamicObject> DynamicObjects { get; set; } = new List<DynamicObject>();

        //[SaveAsJson]
        //public virtual IList<object> AnyObjects { get; set; } = new List<object>();
    }
}
