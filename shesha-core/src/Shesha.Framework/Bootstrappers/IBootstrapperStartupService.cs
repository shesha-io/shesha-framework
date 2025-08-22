using Abp.Domain.Repositories;
using Shesha.Domain;
using Shesha.JsonEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Bootstrappers
{
    public interface IBootstrapperStartupService
    {
        Task<bool> IsForcedAsync(Type bootstrapper);
        Task CompleteBootstrapperAsync(BootstrapperStartup entity, string? result = null, BootstrapperStartupContext? context = null);
        Task FailedBootstrapperAsync(BootstrapperStartup entity, string? result = null, BootstrapperStartupContext? context = null);
        Task SkipBootstrapperAsync(Type bootstrapper, string? result = null, BootstrapperStartupContext? context = null);
        Task<BootstrapperStartup> StartBootstrapperAsync(Type bootstrapper);
    }
}