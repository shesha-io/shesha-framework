using Shesha.Domain.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain.Enum
{
	[ReferenceList("SheshaFunctionalTests", "MaritalStatus")]
	public enum RefListMaritalStatus : long
	{
		/// <summary>
		/// 
		/// </summary>
		[Description("Annulled")]
		[Display(Name = "Annulled")]
		A = 1,

		/// <summary>
		/// 
		/// </summary>
		[Description("Divorced")]
		[Display(Name = "Divorced")]
		D = 2,

		/// <summary>
		/// 
		/// </summary>
		[Description("Interlocutory")]
		[Display(Name = "Interlocutory")]
		I = 3,

		/// <summary>
		/// 
		/// </summary>
		[Description("Legally Separated")]
		[Display(Name = "Legally Separated")]
		L = 4,

		/// <summary>
		/// 
		/// </summary>
		[Description("Married")]
		[Display(Name = "Married")]
		M = 5,

		/// <summary>
		/// 
		/// </summary>
		[Description("Polygamous")]
		[Display(Name = "Polygamous")]
		P = 6,

		/// <summary>
		/// 
		/// </summary>
		[Description("Never Married")]
		[Display(Name = "Never Married")]
		S = 7,

		/// <summary>
		/// 
		/// </summary>
		[Description("Domestic partner")]
		[Display(Name = "Domestic partner")]
		T = 8,

		/// <summary>
		/// 
		/// </summary>
		[Description("Unmarried")]
		[Display(Name = "Unmarried")]
		U = 9,

		/// <summary>
		/// 
		/// </summary>
		[Description("Widowed")]
		[Display(Name = "Widowed")]
		W = 10,

		/// <summary>
		/// 
		/// </summary>
		[Description("Unknown")]
		[Display(Name = "Unknown")]
		UNK = 11
	}
}