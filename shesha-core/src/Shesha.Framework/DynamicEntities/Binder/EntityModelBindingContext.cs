﻿using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Shesha.DynamicEntities.Binder
{
    public class EntityModelBindingContext
    {
        /// <summary>
        /// Validation results for whole model
        /// </summary>
        public List<ValidationResult> ValidationResult { get; set; } = new List<ValidationResult>();
        /// <summary>
        /// Validation results for a specific nested object
        /// </summary>
        public List<ValidationResult> LocalValidationResult { get; set; } = new List<ValidationResult>();

        /// <summary>
        /// Skip validation for whole model
        /// </summary>
        public bool SkipValidation { get; set; } = false;
        /// <summary>
        /// Skip validation for a specific nested object
        /// </summary>
        public bool LocalSkipValidation { get; set; } = false;

        public Func<Type, JObject, EntityModelBindingContext, List<string>?, object> GetObjectOrObjectReference { get; set; }
        
        public Func<Type, string, string?, string, EntityModelBindingContext, object?> GetEntityById { get; set; }

        public int? ArrayItemIndex { get; set; } = null;
    }
}
