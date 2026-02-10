import * as mockService from './mockService';
import * as supabaseService from './supabaseService';

// Toggle this to switch backends
const useMock = false;

export const api = useMock ? mockService : supabaseService;
