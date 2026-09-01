import { crud } from './_crud.js';

export default crud({
  table: 'districts',
  pk: 'id',
  columns: ['name', 'location'],
});
