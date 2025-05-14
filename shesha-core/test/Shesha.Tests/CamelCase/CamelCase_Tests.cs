using Shesha.Utilities;
using Xunit;

namespace Shesha.Tests.CamelCase
{
    /// <summary>
    /// 
    /// </summary>
    [Trait("RunOnPipeline", "yes")]
    public class CamelCase_Tests
    {
        /// <summary>
        /// camelCase
        /// </summary>
        /// <param name="input"></param>
        /// <param name="expected"></param>
        [Theory]
        [InlineData("b2b_registration_request", "b2bRegistrationRequest")]
        [InlineData("b2b-registration-request", "b2bRegistrationRequest")]
        [InlineData("b2b_registration_b2b_request", "b2bRegistrationB2bRequest")]
        [InlineData("foo", "foo")]
        [InlineData("IDs", "ids")]
        [InlineData("FooIDs", "fooIds")]
        [InlineData("foo-bar", "fooBar")]
        [InlineData("foo-bar-baz", "fooBarBaz")]
        [InlineData("foo--bar", "fooBar")]
        [InlineData("--foo-bar", "fooBar")]
        [InlineData("--foo--bar", "fooBar")]
        [InlineData("FOO-BAR", "fooBar")]
        [InlineData("FOÈ-BAR", "foèBar")]
        [InlineData("-foo-bar-", "fooBar")]
        [InlineData("--foo--bar--", "fooBar")]
        [InlineData("foo-1", "foo1")]
        [InlineData("foo.bar", "fooBar")]
        [InlineData("foo..bar", "fooBar")]
        [InlineData("..foo..bar..", "fooBar")]
        [InlineData("foo_bar", "fooBar")]
        [InlineData("__foo__bar__", "fooBar")]
        [InlineData("foo bar", "fooBar")]
        [InlineData("  foo  bar  ", "fooBar")]
        [InlineData("-", "")]
        [InlineData(" - ", "")]
        [InlineData("fooBar", "fooBar")]
        [InlineData("fooBar-baz", "fooBarBaz")]
        [InlineData("foìBar-baz", "foìBarBaz")]
        [InlineData("fooBarBaz-bazzy", "fooBarBazBazzy")]
        [InlineData("FBBazzy", "fbBazzy")]
        [InlineData("F", "f")]
        [InlineData("FooBar", "fooBar")]
        [InlineData("Foo", "foo")]
        [InlineData("FOO", "foo")]
        [InlineData("--", "")]
        [InlineData("", "")]
        [InlineData("_", "")]
        [InlineData(" ", "")]
        [InlineData(".", "")]
        [InlineData("..", "")]
        [InlineData("  ", "")]
        [InlineData("__", "")]
        [InlineData("--__--_--_", "")]
        [InlineData("foo bar?", "fooBar?")]
        [InlineData("foo bar!", "fooBar!")]
        [InlineData("foo bar$", "fooBar$")]
        [InlineData("foo-bar#", "fooBar#")]
        [InlineData("XMLHttpRequest", "xmlHttpRequest")]
        [InlineData("AjaxXMLHttpRequest", "ajaxXmlHttpRequest")]
        [InlineData("Ajax-XMLHttpRequest", "ajaxXmlHttpRequest")]
        [InlineData("mGridCol6@md", "mGridCol6@md")]
        [InlineData("A::a", "a::a")]
        [InlineData("Hello1World", "hello1World")]
        [InlineData("Hello11World", "hello11World")]
        [InlineData("hello1world", "hello1World")]
        [InlineData("Hello1World11foo", "hello1World11Foo")]
        [InlineData("Hello1", "hello1")]
        [InlineData("hello1", "hello1")]
        [InlineData("1Hello", "1Hello")]
        [InlineData("1hello", "1Hello")]
        [InlineData("h2w", "h2W")]
        [InlineData("розовый_пушистый-единороги", "розовыйПушистыйЕдинороги")]
        [InlineData("РОЗОВЫЙ_ПУШИСТЫЙ-ЕДИНОРОГИ", "розовыйПушистыйЕдинороги")]
        [InlineData("桑德在这里。", "桑德在这里。")]
        [InlineData("桑德_在这里。", "桑德在这里。")]
        public void CamelCase_Test(string input, string expected)
        {
            var converted = CamelCaseHelper.Convert(input);
            Assert.Equal(expected, converted);
        }

        /// <summary>
        /// camelCase with pascalCase option
        /// </summary>
        /// <param name="input"></param>
        /// <param name="expected"></param>
        [Theory]
        [InlineData("b2b_registration_request", "B2bRegistrationRequest")]
        [InlineData("foo", "Foo")]
        [InlineData("foo-bar", "FooBar")]
        [InlineData("foo-bar-baz", "FooBarBaz")]
        [InlineData("foo--bar", "FooBar")]
        [InlineData("--foo-bar", "FooBar")]
        [InlineData("--foo--bar", "FooBar")]
        [InlineData("FOO-BAR", "FooBar")]
        [InlineData("FOÈ-BAR", "FoèBar")]
        [InlineData("-foo-bar-", "FooBar")]
        [InlineData("--foo--bar--", "FooBar")]
        [InlineData("foo-1", "Foo1")]
        [InlineData("foo.bar", "FooBar")]
        [InlineData("foo..bar", "FooBar")]
        [InlineData("..foo..bar..", "FooBar")]
        [InlineData("foo_bar", "FooBar")]
        [InlineData("__foo__bar__", "FooBar")]
        [InlineData("foo bar", "FooBar")]
        [InlineData("  foo  bar  ", "FooBar")]
        [InlineData("-", "")]
        [InlineData(" - ", "")]
        [InlineData("fooBar", "FooBar")]
        [InlineData("fooBar-baz", "FooBarBaz")]
        [InlineData("foìBar-baz", "FoìBarBaz")]
        [InlineData("fooBarBaz-bazzy", "FooBarBazBazzy")]
        [InlineData("FBBazzy", "FbBazzy")]
        [InlineData("F", "F")]
        [InlineData("FooBar", "FooBar")]
        [InlineData("Foo", "Foo")]
        [InlineData("FOO", "Foo")]
        [InlineData("--", "")]
        [InlineData("", "")]
        [InlineData("--__--_--_", "")]
        [InlineData("foo bar?", "FooBar?")]
        [InlineData("foo bar!", "FooBar!")]
        [InlineData("foo bar$", "FooBar$")]
        [InlineData("foo-bar#", "FooBar#")]
        [InlineData("XMLHttpRequest", "XmlHttpRequest")]
        [InlineData("AjaxXMLHttpRequest", "AjaxXmlHttpRequest")]
        [InlineData("Ajax-XMLHttpRequest", "AjaxXmlHttpRequest")]
        [InlineData("mGridCol6@md", "MGridCol6@md")]
        [InlineData("A::a", "A::a")]
        [InlineData("Hello1World", "Hello1World")]
        [InlineData("Hello11World", "Hello11World")]
        [InlineData("hello1world", "Hello1World")]
        [InlineData("hello1World", "Hello1World")]
        [InlineData("hello1", "Hello1")]
        [InlineData("Hello1", "Hello1")]
        [InlineData("1hello", "1Hello")]
        [InlineData("1Hello", "1Hello")]
        [InlineData("h1W", "H1W")]
        [InlineData("РозовыйПушистыйЕдинороги", "РозовыйПушистыйЕдинороги")]
        [InlineData("розовый_пушистый-единороги", "РозовыйПушистыйЕдинороги")]
        [InlineData("РОЗОВЫЙ_ПУШИСТЫЙ-ЕДИНОРОГИ", "РозовыйПушистыйЕдинороги")]
        [InlineData("桑德在这里。", "桑德在这里。")]
        [InlineData("桑德_在这里。", "桑德在这里。")]
        [InlineData("a1b", "A1B")]
        public void PascalCase_Test(string input, string expected)
        {
            var converted = CamelCaseHelper.Convert(input, new CamelCaseHelper.ConvertOptions { PascalCase = true });
            Assert.Equal(expected, converted);
        }

        /// <summary>
        /// camelCase with preserveConsecutiveUppercase option
        /// </summary>
        /// <param name="input"></param>
        /// <param name="expected"></param>
        [Theory]
        [InlineData("foo-BAR", "fooBAR")]
        [InlineData("Foo-BAR", "fooBAR")]
        [InlineData("fooBAR", "fooBAR")]
        [InlineData("fooBaR", "fooBaR")]
        [InlineData("FOÈ-BAR", "FOÈBAR")]
        [InlineData("--", "")]
        [InlineData("", "")]
        [InlineData("--__--_--_", "")]
        [InlineData("foo BAR?", "fooBAR?")]
        [InlineData("foo BAR!", "fooBAR!")]
        [InlineData("foo BAR$", "fooBAR$")]
        [InlineData("foo-BAR#", "fooBAR#")]
        [InlineData("XMLHttpRequest", "XMLHttpRequest")]
        [InlineData("AjaxXMLHttpRequest", "ajaxXMLHttpRequest")]
        [InlineData("Ajax-XMLHttpRequest", "ajaxXMLHttpRequest")]
        [InlineData("mGridCOl6@md", "mGridCOl6@md")]
        [InlineData("A::a", "a::a")]
        [InlineData("Hello1WORLD", "hello1WORLD")]
        [InlineData("Hello11WORLD", "hello11WORLD")]
        [InlineData("РозовыйПушистыйFOOдинорогиf", "розовыйПушистыйFOOдинорогиf")]
        [InlineData("桑德在这里。", "桑德在这里。")]
        [InlineData("桑德_在这里。", "桑德在这里。")]
        [InlineData("IDs", "iDs")]
        [InlineData("FooIDs", "fooIDs")]
        public void CamelCase_PreserveConsecutiveUppercase_Test(string input, string expected)
        {
            var converted = CamelCaseHelper.Convert(input, new CamelCaseHelper.ConvertOptions { PreserveConsecutiveUppercase = true });
            Assert.Equal(expected, converted);
        }

        /// <summary>
        /// camelCase with both pascalCase and preserveConsecutiveUppercase option
        /// </summary>
        /// <param name="input"></param>
        /// <param name="expected"></param>
        [Theory]
        [InlineData("foo-BAR", "FooBAR")]
        [InlineData("fooBAR", "FooBAR")]
        [InlineData("fooBaR", "FooBaR")]
        [InlineData("fOÈ-BAR", "FOÈBAR")]
        [InlineData("--foo.BAR", "FooBAR")]
        [InlineData("--", "")]
        [InlineData("", "")]
        [InlineData("--__--_--_", "")]
        [InlineData("foo BAR?", "FooBAR?")]
        [InlineData("foo BAR!", "FooBAR!")]
        [InlineData("Foo BAR$", "FooBAR$")]
        [InlineData("foo-BAR#", "FooBAR#")]
        [InlineData("xMLHttpRequest", "XMLHttpRequest")]
        [InlineData("ajaxXMLHttpRequest", "AjaxXMLHttpRequest")]
        [InlineData("Ajax-XMLHttpRequest", "AjaxXMLHttpRequest")]
        [InlineData("mGridCOl6@md", "MGridCOl6@md")]
        [InlineData("A::a", "A::a")]
        [InlineData("Hello1WORLD", "Hello1WORLD")]
        [InlineData("Hello11WORLD", "Hello11WORLD")]
        [InlineData("pозовыйПушистыйFOOдинорогиf", "PозовыйПушистыйFOOдинорогиf")]
        [InlineData("桑德在这里。", "桑德在这里。")]
        [InlineData("桑德_在这里。", "桑德在这里。")]

        public void PascalCase_PreserveConsecutiveUppercase_Test(string input, string expected)
        {
            var converted = CamelCaseHelper.Convert(input, new CamelCaseHelper.ConvertOptions { PascalCase = true, PreserveConsecutiveUppercase = true });
            Assert.Equal(expected, converted);
        }
    }
}
