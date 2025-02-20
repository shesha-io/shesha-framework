using System;
using System.Collections;

namespace Shesha.EntityHistory
{
    [AttributeUsage(AttributeTargets.Property)]
    public class AuditedAsManyToManyAttribute : Attribute
    {
    }

    [AttributeUsage(AttributeTargets.Property)]
    public class AuditedAsManyToManyAttribute<Pec, E, T> : Attribute
        where Pec : EntityHistoryEventCreatorBase<E, T>
    {
    }

    [AttributeUsage(AttributeTargets.Property)]
    public class AuditedAsManyToManyAttribute<Pec, Cec, E, T> : Attribute
        where Pec : EntityHistoryEventCreatorBase<E, T>
        where Cec : EntityHistoryEventCreatorBase<E, T>
    {
    }
}