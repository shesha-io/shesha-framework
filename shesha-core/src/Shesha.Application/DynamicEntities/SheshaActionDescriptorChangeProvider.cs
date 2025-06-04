using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.Extensions.Primitives;
using System;
using System.Threading;
using System.Threading.Tasks;
namespace Shesha.DynamicEntities
{
    /// <summary>
    /// ASP.Net Core register Controller at runtime
    /// https://stackoverflow.com/questions/46156649/asp-net-core-register-controller-at-runtime
    /// </summary>
    public sealed class SheshaActionDescriptorChangeProvider : IActionDescriptorChangeProvider, IDisposable //ActionDescriptorCollectionProvider, IDisposable//
    {
        private bool _disposed;

        public static SheshaActionDescriptorChangeProvider Instance { get; } = new SheshaActionDescriptorChangeProvider();

        public CancellationTokenSource? TokenSource { get; private set; }

        public bool HasChanged { get; set; }

        public IChangeToken GetChangeToken()
        {
            TokenSource?.Dispose();
            TokenSource = new CancellationTokenSource();
            return new CancellationChangeToken(TokenSource.Token);
        }

        public void Dispose()
        {
            if (_disposed)
            {
                return;
            }

            _disposed = true;
            TokenSource?.Dispose();
        }

        public static async Task RefreshControllersAsync()
        {
            // Notify change
            // ASP.Net Core register Controller at runtime
            // https://stackoverflow.com/questions/46156649/asp-net-core-register-controller-at-runtime
            if (Instance != null)
            {
                Instance.HasChanged = true;
                var tokenSource = Instance.TokenSource;
                if (tokenSource != null)
                    await tokenSource.CancelAsync();
            }
        }
    }
}
