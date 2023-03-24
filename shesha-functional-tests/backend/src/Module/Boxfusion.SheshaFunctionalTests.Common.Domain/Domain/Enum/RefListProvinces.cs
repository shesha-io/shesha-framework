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
	/// <summary>
	/// 
	/// </summary>
	[ReferenceList("SheshaFunctionalTests", "Provinces")]
	public enum RefListProvinces : long
	{
		/// <summary>
		/// 
		/// </summary>
		[Display(Name = "Eastern Cape")]
		[Description("Eastern Cape")]
		EasternCape = 1,

		/// <summary>
		/// 
		/// </summary>
		[Display(Name = "Free State")]
		[Description("Free State")]
		FreeState = 2,

		/// <summary>
		/// 
		/// </summary>
		[Description("Gauteng")]
		Gauteng = 3,

		/// <summary>
		/// 
		/// </summary>
		[Display(Name = "KwaZulu Natal")]
		[Description("KwaZulu Natal")]
		KwaZuluNatal = 4,

		/// <summary>
		/// 
		/// </summary>
		[Description("Limpopo")]
		Limpopo = 5,

		/// <summary>
		/// 
		/// </summary>
		[Description("Mpumalanga")]
		Mpumalanga = 6,

		/// <summary>
		/// 
		/// </summary>
		[Display(Name = "Northern Cape")]
		[Description("Northern Cape")]
		NorthernCape = 7,

		/// <summary>
		/// 
		/// </summary>
		[Display(Name = "North West")]
		[Description("North West")]
		NorthWest = 8,

		/// <summary>
		/// 
		/// </summary>
		[Display(Name = "Western Cape")]
		[Description("Western Cape")]
		WesternCape = 9
	}
}
