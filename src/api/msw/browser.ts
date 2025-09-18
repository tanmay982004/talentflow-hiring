import {setupWorker} from 'msw/browser';
import {handlers} from './handlers';

// Create worker with error handling for cookie issues
export const worker = setupWorker(...handlers);