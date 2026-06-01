import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Энэ endpoint-ийг JWT хамгаалалтгүй (нээлттэй) болгоно. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
