using System.Reflection;
using System.Runtime.InteropServices;
using Shesha;
using Shesha.Attributes;

// General Information about an assembly is controlled through the following
// set of attributes. Change these attribute values to modify the information
// associated with an assembly.
[assembly: AssemblyConfiguration("")]
[assembly: AssemblyCompany("Boxfusion")]
[assembly: AssemblyProduct("Shesha.Scheduler")]
[assembly: AssemblyTrademark("")]

// Setting ComVisible to false makes the types in this assembly not visible
// to COM components.  If you need to access a type in this assembly from
// COM, set the ComVisible attribute to true on that type.
[assembly: ComVisible(false)]

// The following GUID is for the ID of the typelib if this project is exposed to COM
[assembly: Guid("2B7C058D-6524-45B0-8727-A4F7473848A8")]

[assembly: TablePrefix("Core_")]
[assembly: BelongsToConfigurableModule(typeof(SheshaFrameworkModule))]