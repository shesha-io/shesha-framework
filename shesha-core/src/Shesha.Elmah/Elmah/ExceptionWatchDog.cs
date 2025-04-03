using System;
using System.Runtime.ExceptionServices;

namespace Shesha.Elmah
{
    /// <summary>
    /// Exception watchdog
    /// </summary>
    public sealed class ExceptionWatchDog : IDisposable
    {
        private Action<Exception> _onError;
        public Action CleanupAction { get; set; }
        private bool _disposed = false;

        public string? Location { get; set; }

        public ExceptionWatchDog(Action<Exception> onError)
        {
            _onError = onError;

            AppDomain.CurrentDomain.FirstChanceException += OnException;
        }

        private void OnException(object? sender, FirstChanceExceptionEventArgs e)
        {
            if (_disposed)
                return;
            
            _onError.Invoke(e.Exception);
        }

        public void Dispose()
        {
            _disposed = true;

            AppDomain.CurrentDomain.FirstChanceException -= OnException;
            CleanupAction?.Invoke();
        }
    }
}
