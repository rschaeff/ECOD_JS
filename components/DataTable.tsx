// components/DataTable.tsx
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

interface Column {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (item: any) => React.ReactNode;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  emptyMessage?: string;
}

const DataTable: React.FC<DataTableProps> = ({ data, columns, emptyMessage = 'No data available' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead 
                key={col.key} 
                className={col.align ? `text-${col.align}` : ''}
                style={col.width ? { width: col.width } : {}}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              {columns.map((col) => (
                <TableCell 
                  key={`${index}-${col.key}`} 
                  className={col.align ? `text-${col.align}` : ''}
                >
                  {col.render ? col.render(item) : item[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;