import { describe } from 'vitest';

export const describeIntegration = process.env.MIXIN_INTEGRATION_TESTS === '1' ? describe : describe.skip;
