import { crud } from './_crud.js';

export default crud({
  table: 'users',
  pk: 'id',
  columns: ['name', 'role', 'pass', 'district_id', 'phone', 'email', 'photo'],
});
