import ExcelJS from "exceljs";

/**
 * Creates and formats an ExcelJS Workbook with consistent Vouchiqo styling.
 * Follows KISS and DRY principles for both client-side and server-side export.
 *
 * @param {Object} options
 * @param {Array<Object>} options.data - Rows to insert
 * @param {Array<{ header: string, key: string, width?: number }>} options.columns - Column specifications
 * @param {string} [options.sheetName='Sheet1'] - Name of the worksheet
 * @returns {Promise<ExcelJS.Workbook>}
 */
export async function createExcelWorkbook({
  data = [],
  columns = [],
  sheetName = "Data",
}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Vouchiqo Platform";
  workbook.lastModifiedBy = "Vouchiqo Admin";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: true }],
  });

  // Set column headers and keys
  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width || Math.max(col.header.length + 4, 15),
  }));

  // Style Header Row (Slate-900 with white bold text)
  const headerRow = worksheet.getRow(1);
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10, name: "Calibri" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F172A" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: "FF334155" } },
      bottom: { style: "medium", color: { argb: "FF0F172A" } },
      left: { style: "thin", color: { argb: "FF334155" } },
      right: { style: "thin", color: { argb: "FF334155" } },
    };
  });

  // Populate data rows with zebra striping and clean borders
  data.forEach((row, index) => {
    const r = worksheet.addRow(row);
    r.height = 20;
    const isEven = index % 2 === 1;

    r.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = { size: 10, name: "Calibri", color: { argb: "FF1E293B" } };
      cell.alignment = { vertical: "middle" };
      if (isEven) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" },
        };
      }
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
    });
  });

  // Auto-fit column widths based on content length
  worksheet.columns.forEach((column) => {
    let maxLen = column.header ? column.header.length : 10;
    column.eachCell({ includeEmpty: false }, (cell) => {
      const cellLen = cell.value ? String(cell.value).length : 0;
      if (cellLen > maxLen) maxLen = Math.min(cellLen, 50);
    });
    if (!column.width || column.width < maxLen + 3) {
      column.width = Math.max(maxLen + 3, 12);
    }
  });

  return workbook;
}

/**
 * Browser-side helper to download Excel workbook without extra libraries.
 *
 * @param {Object} options
 * @param {Array<Object>} options.data - Data rows to export
 * @param {Array<{ header: string, key: string, width?: number }>} options.columns - Column specifications
 * @param {string} [options.fileName='vouchiqo_export'] - File name without extension
 * @param {string} [options.sheetName='Data'] - Sheet name
 */
export async function downloadExcel({
  data,
  columns,
  fileName = "vouchiqo_export",
  sheetName = "Data",
}) {
  const workbook = await createExcelWorkbook({ data, columns, sheetName });
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const dateStr = new Date().toISOString().slice(0, 10);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${fileName}_${dateStr}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
