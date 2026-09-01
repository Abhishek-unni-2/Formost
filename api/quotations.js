import { crud } from './_crud.js';

export default crud({
  table: 'quotations',
  pk: 'id',
  columns: [
    'customer_name',
    'place',
    'phone',
    'kw',
    'amount',
    'date',
    'notes',
    'created_by',
    'district_id',
  ],
});
