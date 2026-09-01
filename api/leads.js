import { crud } from './_crud.js';

export default crud({
  table: 'leads',
  pk: 'id',
  columns: [
    'name',
    'phone',
    'location',
    'system',
    'source',
    'stage',
    'status',
    'notes',
    'date',
    'district_id',
  ],
});
