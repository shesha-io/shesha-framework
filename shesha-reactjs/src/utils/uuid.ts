import { nanoid } from 'nanoid/non-secure';

/**
 * Returns a nanoid with the lenth of 30
 * We're using this because we get the error below when using the Page.getLayout to persist the layout with NextJS
 *
 * Error: crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported
 * @returns string
 */

export const getNanoId = () => nanoid(30);
