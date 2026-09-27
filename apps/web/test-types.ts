import type { Database } from '@medika/shared';

type Tables = Database['public']['Tables'];
type Patients = Tables['patients']['Row'];

const p: Patients = {} as any;
console.log(p.id);
