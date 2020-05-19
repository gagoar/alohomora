import Table from 'cli-table3';
import { GroupBy } from './constants';
type TableContent = Table.HorizontalTableRow | Table.VerticalTableRow | Table.CrossTableRow;
export const createTable = (head: Table.TableOptions['head'] | undefined, content: TableContent[], style?: Table.TableConstructorOptions['style']) => {

  const table = new Table({
    head,
    style
  });

  table.push(...content);
  return table;
}

type GroupByKeys = keyof typeof GroupBy;

const HEADERS: Record<GroupByKeys, string[]> = {
  'environment': ['Name', 'Updated by', 'Updated at'],
  'name': ['Environment', 'Updated by', 'Updated at']
}

export const getTableHeader = (groupBy?: GroupByKeys) => {
  if (!groupBy) {
    return ['Name', 'Environment', 'Updated by', 'Updated at'];
  }

  return HEADERS[groupBy];
}