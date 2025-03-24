
// Utility function for formatting medical tables and prescriptions

// Format medical tables from markdown to HTML
export const formatMedicalTable = (content: string) => {
  // Verify if content contains a markdown table
  if (content.includes('|') && content.includes('---')) {
    const lines = content.split('\n');
    const tableStartIndex = lines.findIndex(line => line.trim().startsWith('|'));
    
    if (tableStartIndex !== -1) {
      // Check if it's a medical table
      const headerLine = lines[tableStartIndex].toLowerCase();
      const isMedicalTable = headerLine.includes('conduta') || 
                             headerLine.includes('dose') || 
                             headerLine.includes('medicamento') || 
                             headerLine.includes('intervalo');
      
      if (isMedicalTable) {
        // Extract table lines
        let tableLines = [];
        let i = tableStartIndex;
        
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          tableLines.push(lines[i]);
          i++;
        }
        
        // Remove original table from content
        const contentBeforeTable = lines.slice(0, tableStartIndex).join('\n');
        const contentAfterTable = lines.slice(i).join('\n');
        
        // Process headers and rows
        const headers = tableLines[0].split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim());
        
        // Skip separator line (---|---)
        const dataRows = tableLines.slice(2).map(line => 
          line.split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim())
        );
        
        // Create HTML for the table
        const tableHtml = `
        <div class="prescription-table">
          <table>
            <thead>
              <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${dataRows.map(row => `
                <tr>
                  ${row.map(cell => `<td>${cell === 'N/A' ? '-' : cell}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        `;
        
        // Replace table in original content with minimal spacing around it
        return `${contentBeforeTable.trim()}\n${tableHtml}\n${contentAfterTable.trim()}`;
      }
    }
  }
  
  // If not a medical table, continue with prescription detection
  return formatMedicalPrescription(content);
};

// Format medical prescription patterns
export const formatMedicalPrescription = (content: string) => {
  // Detect patterns like "Condutas Iniciais:" or prescription lists
  const conductPattern = /Condutas?\s+Iniciais?:|Condutas?\s*:|Prescrição:|Conduta:\s*([^\n]+)\nDose\/Comp\/Amp:/i;
  
  if (conductPattern.test(content)) {
    // Extract key-value pairs in "Key: Value" format
    const lines = content.split('\n');
    const prescriptionItems = [];
    
    let currentItem: {[key: string]: string} = {};
    let isCollectingPrescription = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if we're starting a prescription section
      if (
        line.match(/Condutas?\s+Iniciais?:|Prescrição:|Medicamentos?:|Condutas?\s+ou\s+Prescrição:/i) || 
        line === '**Condutas Iniciais:**' || 
        line === '**Prescrição:**' ||
        line === '**Condutas ou Prescrição:**'
      ) {
        isCollectingPrescription = true;
        continue;
      }
      
      // If not collecting prescription, continue
      if (!isCollectingPrescription) continue;
      
      // Check if line ends the prescription section
      if (line === '' && Object.keys(currentItem).length > 0) {
        prescriptionItems.push({...currentItem});
        currentItem = {};
        continue;
      }
      
      // If we reach another section, stop collecting
      if (line.match(/^##|^#\s|^Observações:|^\*\*Observações/i) && i > 0) {
        isCollectingPrescription = false;
        continue;
      }
      
      // Extract key-value pairs
      const match = line.match(/^(Conduta|Dose\/Comp\/Amp|Diluição|Via de Administração|Intervalo\/horário):\s*(.+)$/i);
      if (match) {
        const [, key, value] = match;
        currentItem[key] = value;
        
        // If we have all fields or this is the last one, add the item
        const hasAllFields = ['Conduta', 'Dose/Comp/Amp', 'Diluição', 'Via de Administração', 'Intervalo/horário']
          .every(field => field in currentItem || field.toLowerCase() in currentItem);
        
        if (hasAllFields || (i === lines.length - 1)) {
          prescriptionItems.push({...currentItem});
          currentItem = {};
        }
      }
    }
    
    // If we have prescription items, render as a custom table
    if (prescriptionItems.length > 0) {
      const tableContent = `
        <div class="prescription-table">
          <table class="w-full border-collapse">
            <thead>
              <tr>
                <th>Conduta</th>
                <th>Dose/Comp/Amp</th>
                <th>Diluição</th>
                <th>Via de Administração</th>
                <th>Intervalo/horário</th>
              </tr>
            </thead>
            <tbody>
              ${prescriptionItems.map(item => `
                <tr>
                  <td>${item.Conduta || item.conduta || 'N/A'}</td>
                  <td>${item['Dose/Comp/Amp'] || item['dose/comp/amp'] || 'N/A'}</td>
                  <td>${item.Diluição || item.diluição || 'N/A'}</td>
                  <td>${item['Via de Administração'] || item['via de administração'] || 'N/A'}</td>
                  <td>${item['Intervalo/horário'] || item['intervalo/horário'] || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      
      // Replace prescription section with formatted table - reduce whitespace and improve spacing
      return content.replace(
        new RegExp(`(Condutas?\\s+Iniciais?:|Prescrição:|Medicamentos?:|\\*\\*Condutas\\s+ou\\s+Prescrição:\\*\\*)[\\s\\S]*?(##|#\\s|Observações:|$)`, 'i'),
        (match, prefix, suffix) => {
          return `${prefix.trim()}\n${tableContent}\n${suffix.trim()}`;
        }
      );
    }
  }
  
  return content;
};
