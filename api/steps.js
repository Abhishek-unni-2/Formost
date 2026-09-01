import { crud } from './_crud.js';

export default crud({
  table: 'steps',
  pk: 'num',
  columns: ['icon', 'title', 'role', 'dept', 'description'],
});
