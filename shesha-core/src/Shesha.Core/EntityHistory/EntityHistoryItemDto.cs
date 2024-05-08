using Abp.Application.Services.Dto;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.EntityHistory
{
    public class EntityHistoryItemDto : EntityDto
    {
        //EntityCahgeSetId
        //public virtual EntityChangeSet EntityChangeSet { get; set; }

        [Display(Name = "Date")]
        public DateTime? CreationTime { get; set; }
        
        //EntityChangeId
        //public virtual EntityChange EntityChange { get; set; }
        
        public int? HistoryItemType { get; set; }
        
        public string EntityId { get; set; }
        
        public string EntityTypeFullName { get; set; }
        
        public string EventType { get; set; }
        
        //public string EventName { get; set; }
        
        //public string Description { get; set; }

        [Display(Name = "User")]
        public string UserFullName { get; set; }

        [Display(Name = "Type of event")]
        public string EventText { get; set; }

        [Display(Name = "Description")]
        public string ExtendedDescription { get; set; }
    }
}