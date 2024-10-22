import { COUNTRY_CODES } from "@/shesha-constants/country-codes";

export const getValueFromString = (string: string) => {
    switch (string) {
        case "COUNTRY_CODES":
            return COUNTRY_CODES;
        default:
            return [];
    }
};