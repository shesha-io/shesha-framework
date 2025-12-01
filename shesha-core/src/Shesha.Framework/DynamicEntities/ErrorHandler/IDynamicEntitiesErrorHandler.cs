using Shesha.Domain;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.ErrorHandler
{
    public interface IDynamicEntitiesErrorHandler
    {
        List<Exception> Exceptions { get; }
        DateTime LastComplete { get; }

        Task HandleInitializationErrorAsync(Exception exception);

        void Complete();
    }
}