using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.Utilities
{
    /*
    public static class AsyncHelper
    {
        /// <summary>
        /// Execute's an async Task{T} method which has a void return value synchronously
        /// </summary>
        /// <param name="task">Task{T} method to execute</param>
        public static void RunSync(Func<Task> task)
        {
            var oldContext = SynchronizationContext.Current;
            using var synch = new ExclusiveSynchronizationContext();
            SynchronizationContext.SetSynchronizationContext(synch);
#pragma warning disable VSTHRD101 // Rethrow to preserve stack details
#pragma warning disable AsyncFixer03
            synch.Post(async _ =>
            {
                try
                {
                    await task();
                }
                catch (Exception e)
                {
                    synch.InnerException = e;
                    throw;
                }
                finally
                {
                    synch.EndMessageLoop();
                }
            }, null);
#pragma warning restore AsyncFixer03
#pragma warning restore VSTHRD101 // Rethrow to preserve stack details
            synch.BeginMessageLoop();

            SynchronizationContext.SetSynchronizationContext(oldContext);
        }

        /// <summary>
        /// Execute's an async Task{T} method which has a T return type synchronously
        /// </summary>
        /// <typeparam name="T">Return Type</typeparam>
        /// <param name="task">Task{T} method to execute</param>
        /// <returns></returns>
        public static T RunSync<T>(Func<Task<T>> task)
        {
            var oldContext = SynchronizationContext.Current;
            using var synch = new ExclusiveSynchronizationContext();
            SynchronizationContext.SetSynchronizationContext(synch);
            var ret = default(T);
#pragma warning disable VSTHRD101 // Rethrow to preserve stack details
#pragma warning disable AsyncFixer03 // Avoid unsupported fire-and-forget async-void methods or delegates. Unhandled exceptions will crash the process.
            synch.Post(async _ =>
            {
                try
                {
                    ret = await task();
                }
                catch (Exception e)
                {
                    synch.InnerException = e;
                    throw;
                }
                finally
                {
                    synch.EndMessageLoop();
                }
            }, null);
#pragma warning restore AsyncFixer03 // Avoid unsupported fire-and-forget async-void methods or delegates. Unhandled exceptions will crash the process.
#pragma warning restore VSTHRD101 // Rethrow to preserve stack details
            synch.BeginMessageLoop();
            SynchronizationContext.SetSynchronizationContext(oldContext);
#pragma warning disable CS8603 // Possible null reference return.
            return ret;
#pragma warning restore CS8603 // Possible null reference return.
        }

        private sealed class ExclusiveSynchronizationContext : SynchronizationContext, IDisposable
        {
            private bool done;
            private bool disposed;

            public Exception InnerException { get; set; }
            private readonly AutoResetEvent _workItemsWaiting;
            readonly Queue<Tuple<SendOrPostCallback, object?>> items = new Queue<Tuple<SendOrPostCallback, object?>>();

#pragma warning disable CS8618
            public ExclusiveSynchronizationContext()
            {
                _workItemsWaiting = new AutoResetEvent(false);
            }
#pragma warning restore CS8618

            public override void Send(SendOrPostCallback d, object? state)
            {
                throw new NotSupportedException("We cannot send to our same thread");
            }

            public override void Post(SendOrPostCallback d, object? state)
            {
                lock (items)
                {
                    items.Enqueue(Tuple.Create(d, state));
                }
                _workItemsWaiting.Set();
            }

            public void EndMessageLoop()
            {
                Post(_ => done = true, null);
            }

            public void BeginMessageLoop()
            {
                while (!done)
                {
                    Tuple<SendOrPostCallback, object?>? task = null;
                    lock (items)
                    {
                        if (items.Count > 0)
                        {
                            task = items.Dequeue();
                        }
                    }
                    if (task != null)
                    {
                        task.Item1(task.Item2);
                        if (InnerException != null) // the method threw an exeption
                        {
                            throw new AggregateException("AsyncHelpers.Run method threw an exception.", InnerException);
                        }
                    }
                    else
                    {
                        _workItemsWaiting.WaitOne();
                    }
                }
            }

            public override SynchronizationContext CreateCopy()
            {
                return this;
            }

            public void Dispose()
            {
                if (disposed)
                {
                    return;
                }

                disposed = true;
                _workItemsWaiting.Dispose();
            }
        }
    }
    */
}