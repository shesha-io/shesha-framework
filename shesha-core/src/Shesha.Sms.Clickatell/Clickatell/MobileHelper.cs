namespace Shesha.Sms.Clickatell
{
    internal static class MobileHelper
    {
        public static string CleanupmobileNo(string mobileNumber)
        {
            // Removing any spaces and any other common characters in a phone number.
            mobileNumber = mobileNumber.Replace(" ", "");
            mobileNumber = mobileNumber.Replace("-", "");
            mobileNumber = mobileNumber.Replace("(", "");
            mobileNumber = mobileNumber.Replace(")", "");

            if (mobileNumber.Length < 10)
                mobileNumber = mobileNumber.PadLeft(10, '0');

            // Converting to the required format i.e. '27XXXXXXXXX'
            if (mobileNumber.StartsWith("0027"))
                mobileNumber = "27" + mobileNumber.Substring(4);

            if (mobileNumber.StartsWith("0"))
                mobileNumber = "27" + mobileNumber.Substring(1);

            return mobileNumber;
        }
    }
}
