import { isDevMode } from '@angular/core';

export const API_URL = isDevMode()
    ? 'http://localhost:3000'
    : 'https://tp-2-red-social-ortiz-julian.vercel.app';