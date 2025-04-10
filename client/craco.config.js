import { resolve } from 'path';

export const webpack = {
    alias: {
        '@': resolve(__dirname, 'src'),
    },
};
