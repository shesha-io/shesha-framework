using Abp.Application.Services.Dto;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.EntityHistory
{
    public class EntityHistoryItemDto : EntityDto
    {
        [Display(Name = "Date")]
        public DateTime? CreationTime { get; set; }
        
        public int? HistoryItemType { get; set; }
        
        public string EntityId { get; set; }
        
        public string EntityTypeFullName { get; set; }
        
        public string EventType { get; set; }
        
        [Display(Name = "User")]
        public string UserFullName { get; set; }

        [Display(Name = "Impersonator user")]
        public string ImpersonatorUserFullName { get; set; }

        [Display(Name = "Type of event")]
        public string EventText { get; set; }

        [Display(Name = "Description")]
        public string ExtendedDescription { get; set; }

        public EntityHistoryItemDto()
        {
            
        }
    }
}