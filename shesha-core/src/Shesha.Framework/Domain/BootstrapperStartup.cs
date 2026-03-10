using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using Shesha.JsonEntities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    public enum BootstrapperStartupStatus
    {
        Unknown = 0,
        Started = 1,
        Completed = 2,
        Failed = 3,
        Skipped = 4,
    }

    public class BootstrapperStartupLog
    {
        public DateTime Date { get; set; }
        public string Log { get; set; }
    }

    public class BootstrapperStartupContext: JsonEntity
    {
        public List<BootstrapperStartupLog> Log { get; set; } = new List<BootstrapperStartupLog>();

        public string ExtendedResult { get; set; }

        public void AddLog(string log, DateTime? date = null)
        {
            Log.Add(new BootstrapperStartupLog { Date = date ?? DateTime.Now, Log = log });
        }
    }

    [SnakeCaseNaming]
    [Table("bootstrapper_startups", Schema = "frwk")]
    public class BootstrapperStartup: Entity<Guid>
    {
        public virtual DateTime CreationTime { get; set; }
        public virtual bool Force { get; set; }
        public virtual string BootstrapperName { get; set; }
        public virtual BootstrapperStartupStatus Status { get; set; }
        public virtual DateTime? StartedOn { get; set; }
        public virtual DateTime? FinishedOn { get; set; }
        public virtual string? Result { get; set; }
        public virtual BootstrapperStartupContext? Context { get; set; }
    }
}
