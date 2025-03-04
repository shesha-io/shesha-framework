﻿using Abp.EntityHistory;
using Abp.Runtime.Session;
using System;

namespace Shesha.EntityHistory
{
    public interface IEntityHistoryCreator
    {
        bool TypeAllowed(Type type);

        EntityChange? GetEntityChange(object entity, IAbpSession abpSession, string[] propertyNames, object[] loadedState, object[] currentState, Int32[] dirtyProps);

    }
}