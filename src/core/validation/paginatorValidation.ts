import { query } from 'express-validator';
import { SortDirection } from '../types/PaginationAndSorting';

const createPaginationAndSortingValidationSchema = <T>(
  fieldsForSorting: T[],
  defaultValues: { pageSize: number; sortDirection: SortDirection; sortBy: T },
) => {
  const { pageSize, sortDirection, sortBy } = defaultValues;
  const sortDirections = Object.values(SortDirection);
  const paginatorValidationSchema = [
    query('pageNumber')
      .default(1)
      .isInt().withMessage('Page number must be integer')
      .toInt(),
    query('pageSize')
      .default(pageSize)
      .isInt().withMessage('Page number must be integer')
      .toInt(),
    query('sortDirection')
      .default(sortDirection)
      .isIn(sortDirections)
      .withMessage('Sort direction can have one of the following values: ' + sortDirections),
    query('sortBy')
      .default(sortBy)
      .isIn(fieldsForSorting)
      .withMessage('Sort by can have one of the following values: ' + fieldsForSorting),
  ];

  return paginatorValidationSchema;
};

export { createPaginationAndSortingValidationSchema };
