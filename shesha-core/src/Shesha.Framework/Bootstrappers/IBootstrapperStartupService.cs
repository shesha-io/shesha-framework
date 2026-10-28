using Shesha.Domain;
using System;
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