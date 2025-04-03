
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
        
        // Create HTML for the table with enhanced styling
        const tableHtml = `<div class="prescription-table"><table class="w-full border-collapse rounded-md overflow-hidden"><thead class="bg-sky-50 dark:bg-sky-900/20"><tr>${headers.map(header => `<th class="p-2 text-left border border-sky-100 dark:border-sky-900/30 font-semibold text-iatros-blue dark:text-sky-300">${header}</th>`).join('')}</tr></thead><tbody>${dataRows.map(row => `<tr class="border-b border-sky-100 dark:border-sky-900/30">${row.map(cell => `<td class="p-2 border border-sky-100 dark:border-sky-900/30">${cell === 'N/A' ? '-' : cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
        
        // Replace table in original content
        return `${contentBeforeTable.trim()}${tableHtml}${contentAfterTable.trim()}`;
      }
    }
  }
  
  // Format special medical sections and headings
  content = content.replace(/\*\*([^*\n]+):\*\*/g, '<h3 class="text-iatros-blue dark:text-sky-300 font-bold my-2">$1:</h3>');
  content = content.replace(/\*\*PLANO DE AÇÃO IMEDIATO[^*]*\*\*/g, '<h2 class="text-iatros-blue dark:text-sky-300 font-bold my-3">PLANO DE AÇÃO IMEDIATO</h2>');
  content = content.replace(/\*\*Confirmação[^*]*\*\*/g, '<h2 class="text-iatros-blue dark:text-sky-300 font-bold my-3">Confirmação de IAMCSST</h2>');
  
  // If not a medical table, continue with prescription detection
  return formatMedicalPrescription(content);
};

// Format medical prescription patterns
export const formatMedicalPrescription = (content: string) => {
  // Detect patterns like "Condutas Iniciais:" or prescription lists
  const conductPattern = /Condutas?\s+Iniciais?:|Condutas?\s*:|Prescrição:|Conduta:\s*([^\n]+)\nDose\/Comp\/Amp:|(\*\*Condutas\s+ou\s+Prescrição:\*\*)/i;
  
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
    
    // If we have prescription items, render as a better formatted table
    if (prescriptionItems.length > 0) {
      const tableContent = `<div class="prescription-table mt-2"><table class="w-full border-collapse rounded-md overflow-hidden">
        <thead class="bg-sky-50 dark:bg-sky-900/20">
          <tr>
            <th class="p-2 text-left border border-sky-100 dark:border-sky-900/30 font-semibold text-iatros-blue dark:text-sky-300">Conduta</th>
            <th class="p-2 text-left border border-sky-100 dark:border-sky-900/30 font-semibold text-iatros-blue dark:text-sky-300">Dose/Comp/Amp</th>
            <th class="p-2 text-left border border-sky-100 dark:border-sky-900/30 font-semibold text-iatros-blue dark:text-sky-300">Diluição</th>
            <th class="p-2 text-left border border-sky-100 dark:border-sky-900/30 font-semibold text-iatros-blue dark:text-sky-300">Via de Administração</th>
            <th class="p-2 text-left border border-sky-100 dark:border-sky-900/30 font-semibold text-iatros-blue dark:text-sky-300">Intervalo/horário</th>
          </tr>
        </thead>
        <tbody>
          ${prescriptionItems.map(item => `
            <tr class="border-b border-sky-100 dark:border-sky-900/30">
              <td class="p-2 border border-sky-100 dark:border-sky-900/30">${item.Conduta || item.conduta || 'N/A'}</td>
              <td class="p-2 border border-sky-100 dark:border-sky-900/30">${item['Dose/Comp/Amp'] || item['dose/comp/amp'] || 'N/A'}</td>
              <td class="p-2 border border-sky-100 dark:border-sky-900/30">${item.Diluição || item.diluição || 'N/A'}</td>
              <td class="p-2 border border-sky-100 dark:border-sky-900/30">${item['Via de Administração'] || item['via de administração'] || 'N/A'}</td>
              <td class="p-2 border border-sky-100 dark:border-sky-900/30">${item['Intervalo/horário'] || item['intervalo/horário'] || 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table></div>`;
      
      // Replace prescription section with formatted table
      return content.replace(
        new RegExp(`(Condutas?\\s+Iniciais?:|Prescrição:|Medicamentos?:|\\*\\*Condutas\\s+ou\\s+Prescrição:\\*\\*)[\\s\\S]*?(##|#\\s|Observações:|$)`, 'i'),
        (match, prefix, suffix) => {
          return `<h3 class="text-iatros-blue dark:text-sky-300 font-bold my-2">Prescrição:</h3>${tableContent}${suffix}`;
        }
      );
    }
  }
  
  return content;
};
