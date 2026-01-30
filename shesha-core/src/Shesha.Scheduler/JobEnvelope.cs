using JetBrains.Annotations;
using System;

namespace Shesha.Scheduler
{
    public class JobEnvelope
    {
        public Guid JobId { get; set; }
        public Guid? ExecutionId { get; set; }
        public Int64? StartedById { get; set; }
        public string ParametersJson { get; set; }

        [UsedImplicitly]
        public JobEnvelope()
        {
            
        }

        public JobEnvelope(Guid jobId)
        {
            JobId = jobId;
        }
    }

    public class JobEnvelope<TParams> : JobEnvelope where TParams : class, new()
    {
        public TParams Parameters { get; set; }

        [UsedImplicitly]
        public JobEnvelope()
        {
            
        }

        public JobEnvelope(Guid jobId, TParams parameters): base(jobId)
        {
            Parameters = parameters;
        }
    }
}
