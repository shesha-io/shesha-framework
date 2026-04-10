import { DATE_TIME_FORMATS } from "@/constants/formats";
import moment from "moment";
import { isNullOrWhiteSpace } from "./nullables";

// Common date formats to support
const SUPPORTED_DATE_FORMATS = [
  'YYYY-MM-DD', // 2004-12-01
  'DD-MM-YYYY', // 01-12-2004
  'MM-DD-YYYY', // 12-01-2004
  'YYYY/MM/DD', // 2004/12/01
  'DD/MM/YYYY', // 01/12/2004
  'MM/DD/YYYY', // 12/01/2004
  'YYYYMMDDTHHmmss', // 20041201T000000
  'YYYY-MM-DDTHH:mm:ss', // 2004-12-01T00:00:00
];

const isValidDate = (dateString: string): boolean => {
  // Try parsing with each supported format
  return SUPPORTED_DATE_FORMATS.some((format) => moment(dateString, format, true).isValid());
};

const parseDate = (dateString: string): moment.Moment | null => {
  for (const format of SUPPORTED_DATE_FORMATS) {
    const parsed = moment(dateString, format, true);
    if (parsed.isValid()) {
      return parsed;
    }
  }
  return null;
};

const formatDate = (dateText: string, targetFormat: string): string => {
  const parsed = parseDate(dateText);
  if (parsed) {
    return parsed.format(targetFormat);
  }
  return dateText; // Return original text if parsing fails
};

export const formatDateStringAndPrefix = (content: string, dateFormat: string = DATE_TIME_FORMATS.date): string => {
  // Match any date-like pattern
  const datePattern =
    /\d{2}[-/]\d{2}[-/]\d{4}|\d{4}[-/]\d{2}[-/]\d{2}|\d{4}\d{2}\d{2}T\d{6}|\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g;

  return !isNullOrWhiteSpace(content)
    ? content.replace(datePattern, (match) => {
      if (isValidDate(match)) {
        return formatDate(match, dateFormat);
      }
      return match;
    })
    : content;
};
