interface PrintTableButtonProps<T> {
  data: T[];
  headers: { key: keyof T; label: string }[];
  renderRow: (item: T) => string;
  title?: string;
}

const PrintTableButton = <T,>({
  data,
  headers,
  renderRow,
  title = 'Data',
}: PrintTableButtonProps<T>) => {
  const printTableData = () => {
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid black;
              padding: 8px;
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <table>
            <thead>
              <tr>
                ${headers.map((header) => `<th>${header.label}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map((item) => `<tr>${renderRow(item)}</tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow?.document.close();
    printWindow?.print();
  };

  return (
    <button
      onClick={printTableData}
      className="ml-4 bg-indigo-500 hover:bg-pink-500 duration-200 text-white px-4 py-2 rounded mb-4"
    >
      Print Table
    </button>
  );
};

export default PrintTableButton;
