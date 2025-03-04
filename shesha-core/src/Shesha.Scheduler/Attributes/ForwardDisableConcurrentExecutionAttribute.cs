﻿using Hangfire;
using Hangfire.Common;
using Hangfire.Server;
using Shesha.Reflection;
using Shesha.Scheduler.Services.ScheduledJobs;
using Shesha.Services;
using System;
using System.Linq;

namespace Shesha.Scheduler.Attributes
{
    /// <summary>
    /// Attribute to forward <see cref="DisableConcurrentExecutionAttribute"/> to <see cref="ScheduledJobAppService"/>
    /// </summary>
    [AttributeUsage(AttributeTargets.Method)]
    public class ForwardDisableConcurrentExecutionAttribute : JobFilterAttribute, IServerFilter
    {
        private const string LockAcquiredKey = "ShaLockAcquired";
        private const string DistributedLockKey = "DistributedLock";

        public ForwardDisableConcurrentExecutionAttribute()
        {
        }

        public void OnPerforming(PerformingContext filterContext)
        {
            var triggerId = (Guid)filterContext.BackgroundJob.Job.Args.First();

            var jobManager = StaticContext.IocManager.Resolve<IScheduledJobManager>();

            var jobType = jobManager.GetJobType(triggerId);

            var jobAttribute = jobType.GetAttributeOrNull<ScheduledJobAttribute>();
            if (jobAttribute == null)
                throw new NotSupportedException($"Job '{jobType.FullName}' must be decorated with '{nameof(ScheduledJobAttribute)}'");

            var disableConcurrentAttribute = jobType.GetAttributeOrNull<DisableConcurrentExecutionAttribute>();
            if (disableConcurrentAttribute == null)
                return;

            var resource = jobAttribute.Uid.ToString();

            var timeout = TimeSpan.FromSeconds(disableConcurrentAttribute.TimeoutSec);

            var distributedLock = filterContext.Connection.AcquireDistributedLock(resource, timeout);
            filterContext.Items[DistributedLockKey] = distributedLock;
            filterContext.Items[LockAcquiredKey] = true;
        }

        public void OnPerformed(PerformedContext filterContext)
        {
            if (!filterContext.Items.ContainsKey(LockAcquiredKey))
                return;

            if (!filterContext.Items.ContainsKey("DistributedLock"))
            {
                throw new InvalidOperationException("Can not release a distributed lock: it was not acquired.");
            }

            var distributedLock = (IDisposable)filterContext.Items[DistributedLockKey];
            distributedLock.Dispose();
        }
    }
}
