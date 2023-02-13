using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain
{
    /// <summary>
    /// A Front-end App represents the various front-end applications that build off this back-end. 
    /// For example, Admin Portal, Customer Portal, Customer Mobile App would be fairly typical examples.
    /// </summary>
    public class FrontEndApp : FullPowerEntity
    {
        /// <summary>
        /// Unique identifier of the application (key). This key is used for identification of the front-end app
        /// </summary>
        [StringLength(100)]
        public virtual string AppKey { get; set; }

        /// <summary>
        /// Name of the front-end app.
        /// </summary>
        [StringLength(100)]
        public virtual string Name { get; set; }

        /// <summary>
        /// Description of the Front-end application.
        /// </summary>
        public virtual string Description { get; set; }

    }
}
