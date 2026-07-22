using Hangfire.Server;
using Hangfire.Storage;
using Newtonsoft.Json;
using System;

namespace Shesha.Scheduler.Extensions
{
    internal static class ContextExtensions
    {
        private const string executionIdKey = "JobExecutionId";
        private const string jobIdKey = "JobId";

        public static void SetExecutionId(this PerformContext context, Guid executionId)
        {
            if (context != null)
                context.SetJobParameter(executionIdKey, executionId.ToString());
        }

        public static void SetJobId(this PerformContext context, Guid jobId)
        {
            if (context != null)
                context.SetJobParameter(jobIdKey, jobId.ToString());
        }

        private static Guid? GetGuidOrNull(JobData jobData, string key)
        {
            if (!jobData.ParametersSnapshot.TryGetValue(key, out var rawValue))
                return null;

            return JsonConvert.DeserializeObject<Guid>(rawValue);
        }

        public static Guid? GetJobId(this JobData jobData)
        {
            return GetGuidOrNull(jobData, jobIdKey);
        }

        public static Guid? GetExecutionId(this JobData jobData)
        {
            return GetGuidOrNull(jobData, executionIdKey);
        }
    }
}
