import { SetMetadata } from '@nestjs/common';

export const IS_SKIP_AUTH = 'skipAuth';
export const SkipAuth = () => SetMetadata(IS_SKIP_AUTH, true);
