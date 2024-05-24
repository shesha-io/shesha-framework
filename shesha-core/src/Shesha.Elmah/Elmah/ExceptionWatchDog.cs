using System;
using System.Runtime.ExceptionServices;

namespace Shesha.Elmah
{
    /// <summary>
    /// Exception watchdog
    /// </summary>
    public class ExceptionWatchDog : IDisposable
    {
        private Action<Exception> _onError;
        public Action CleanupAction { get; set; }

        public ExceptionWatchDog(Action<Exception> onError)
        {
            _onError = onError;

            AppDomain.CurrentDomain.FirstChanceException += OnException;
        }

        private void OnException(object sender, FirstChanceExceptionEventArgs e)
        {
            _onError.Invoke(e.Exception);
        }

        public void Dispose()
        {
            AppDomain.CurrentDomain.FirstChanceException -= OnException;
            CleanupAction?.Invoke();
        }
    }
}
