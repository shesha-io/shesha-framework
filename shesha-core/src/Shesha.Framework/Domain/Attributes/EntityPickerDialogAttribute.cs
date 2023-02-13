using System;

namespace Shesha.Domain.Attributes
{
    /// <summary>
    /// Forces the system to use EntityPickerDialog control for editing of the property.
    /// </summary>
    [AttributeUsage(AttributeTargets.Property, AllowMultiple = false, Inherited = true)]
    public class EntityPickerDialogAttribute : Attribute//, IMetadataAware
    {
        public string PickerDialogId { get; set; }
        public bool CanAdd { get; set; }
        public bool CanEdit { get; set; }

        /// <summary>
        /// Forces the system to use EntityPickerDialog control for editing of the property. Default configuration will be used
        /// </summary>
        public EntityPickerDialogAttribute()
        {
        }

        /// <summary>
        /// Forces the system to use EntityPickerDialog control for editing of the property.
        /// </summary>
        /// <param name="pickerDialogId">Id of the picker dialog configuration</param>
        public EntityPickerDialogAttribute(string pickerDialogId)
        {
            PickerDialogId = pickerDialogId;
        }

        //public void OnMetadataCreated(ModelMetadata metadata)
        //{
        //    var sheshaMetadata = metadata.Shesha();

        //    sheshaMetadata.EditorControl = GenericEditorControl.EntityPicker;
        //    sheshaMetadata.EntityPickerDialogId = PickerDialogId;
        //    sheshaMetadata.EntityPickerDialogCanAdd = CanAdd;
        //    sheshaMetadata.EntityPickerDialogCanEdit = CanEdit;
        //}
    }
}
