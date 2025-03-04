﻿using Abp.Auditing;
using Abp.Domain.Entities;
using Newtonsoft.Json;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities.Dtos;
using Shesha.EntityHistory;
using Shesha.EntityReferences;
using Shesha.JsonEntities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Reflection;

namespace Shesha.Test
{
    public class ComplexTestDto : DynamicDto<ComplexTest, Guid>
    {
        public virtual string Name { get; set; }

        public virtual string Description { get; set; }

        public virtual DateTime? TestDateTime { get; set; }

        public virtual bool TestBoolean { get; set; }

        public virtual bool TestBooleanAudited { get; set; }

        public virtual RefListGender RefListGender { get; set; }

        public virtual EntityReferenceDto<Guid> Person { get; set; }

        public virtual List<JsonEntity> JsonList { get; set; }

        public virtual JsonPerson JsonPerson { get; set; }

        public virtual JsonEntity Any { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            throw new NotImplementedException();
        }
    }

    [Table("Test_ComplexTest")]
    [Entity(GenerateApplicationService = GenerateApplicationServiceState.AlwaysGenerateApplicationService)]
    public class ComplexTest : Entity<Guid>// where T : JsonEntity
    {
        [Audited]
        public virtual string Name { get; set; }

        [Audited]
        public virtual string Description { get; set; }

        [Audited]
        public virtual DateTime? TestDateTime { get; set; }

        [Audited]
        public virtual bool? TestBoolean { get; set; }

        [AuditedBoolean("Good", "Bad")]
        public virtual bool? TestBooleanAudited { get; set; }

        private class RefListGenderEventCreator : EntityHistoryEventCreatorBase<ComplexTest, RefListGender>
        {
            public override EntityHistoryEventInfo CreateEvent(EntityChangesInfo<ComplexTest, RefListGender> change)
            {
                return CreateEvent("ComplexTest gender changed",
                    change.NewValue == Domain.Enums.RefListGender.Female
                        ? "Female!!!!!"
                        : change.NewValue == Domain.Enums.RefListGender.Male
                            ? "Male!!!!!"
                            : "AAAAAA Panic!!!!");
            }
        }

        [AuditedAsEvent(typeof(RefListGenderEventCreator))]
        public virtual RefListGender? RefListGender { get; set; }

        [Audited]
        public virtual Person Person { get; set; }

        [SaveAsJson]
        public virtual List<JsonEntity> JsonList { get; set; }

        public virtual JsonPerson JsonPerson { get; set; }

        public virtual JsonBase AnyJson { get; set; }

        [EntityReference(true)]
        public virtual GenericEntityReference AnyEntity { get; set; }
    }

    public class InnerComplexTest
    {
        public virtual string ComplexName { get; set; }
        public virtual string ComplexDescription { get; set; }
    }

    public class JsonBase : JsonEntity
    {
        public virtual string Text { get; set; }
    }

    public class JsonAddress : JsonBase
    {
        public virtual string Town { get; set; }
        public virtual string Street { get; set; }

        public virtual int PostalCode { get; set; }
    }

    public class JsonOrganisation : JsonBase
    {
        public virtual string Name { get; set; }
        public virtual JsonAddress Address { get; set; }
    }

    public class JsonPerson : JsonBase
    {
        public virtual Person? Person { get; set; }
        public virtual JsonAddress Address { get; set; }

        public virtual List<JsonPerson> Persons { get; set; }

        public virtual string FirstName { get; set; }
        public virtual string LastName { get; set; }
    }

    public class JsonEntityReference<T, TId> where T : IEntity<TId>
    {
        private PropertyInfo? _displayNamePropertyInfo;
        public JsonEntityReference()
        {
            _displayNamePropertyInfo = typeof(T).GetEntityConfiguration()?.DisplayNamePropertyInfo;
        }

        [JsonIgnore]
        public virtual T Entity { get; set; }

        public virtual TId? Id => Entity != null ? Entity.Id : default;

        public virtual string? DisplayName => Entity != null 
            ? _displayNamePropertyInfo != null 
                ? _displayNamePropertyInfo.GetValue(Entity)?.ToString() 
                : Entity.ToString()
            : null;
    }
}