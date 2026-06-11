export const SELECT_WIDTH_OFFSET_RIGHT = 48;
const DEFAULT_FONT_SIZE = "14px";
const DEFAULT_FONT_FAMILY = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export const calcTextWidth = (str: string, fontFamily: string = DEFAULT_FONT_FAMILY, fontSize: string = DEFAULT_FONT_SIZE): number => {
  let div = document.createElement("div");
  div.innerHTML = str;
  div.style.fontSize = fontSize;
  div.style.fontFamily = fontFamily;
  div.style.position = "absolute";
  div.style.float = "left";
  div.style.whiteSpace = "nowrap";
  div.style.visibility = "hidden";

  div = document.body.appendChild(div);
  const w = div.offsetWidth;
  document.body.removeChild(div);
  return w;
};
