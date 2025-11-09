import { forwardRef } from 'react';

/**
 * Template del contrato Documents Required for Purchase
 * Con checkboxes personalizables para cada documento requerido
 */
const DocumentsPurchase = forwardRef(({ client, date, selectedDocs = [] }, ref) => {
  // Función para verificar si un documento está seleccionado
  const isChecked = (docId) => selectedDocs.includes(docId);

  // Renderizar símbolo simple (sin casilla)
  const CheckSymbol = ({ checked }) => (
    <span style={{
      display: 'inline-block',
      width: '20px',
      marginRight: '8px',
      fontWeight: 'bold',
      fontSize: '12pt'
    }}>
      {checked ? '✓' : '___'}
    </span>
  );

  return (
    <div ref={ref} style={{
      width: '8.5in',
      minHeight: '11in',
      padding: '0.5in 0.75in',
      backgroundColor: 'white',
      fontFamily: 'Arial, sans-serif',
      fontSize: '11pt',
      color: '#000',
      boxSizing: 'border-box',
      margin: '0',
      position: 'relative',
      left: '0',
      top: '0'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ 
          fontSize: '18pt', 
          fontWeight: 'bold', 
          margin: '0 0 8px 0',
          letterSpacing: '0.5px'
        }}>
          EL COMPA GUERO AUTO SALES LLC
        </h1>
        <p style={{ margin: '3px 0', fontSize: '10pt' }}>
          915 12TH ST SE, SALEM, OR 97302
        </p>
        <p style={{ margin: '3px 0', fontSize: '10pt' }}>
          PHONE: (503) 878 9550
        </p>
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '35px' }}>
        <h2 style={{ 
          fontSize: '14pt', 
          fontWeight: 'bold', 
          margin: '0 0 5px 0'
        }}>
          DOCUMENTS REQUIRED FOR PURCHASE
        </h2>
        <h2 style={{ 
          fontSize: '14pt', 
          fontWeight: 'bold', 
          margin: '0'
        }}>
          DOCUMENTOS REQUERIDOS PARA COMPRAR
        </h2>
      </div>

      {/* English Section */}
      <div style={{ marginBottom: '25px' }}>
        <p style={{ 
          textAlign: 'justify', 
          lineHeight: '1.5',
          margin: '0'
        }}>
          I, <span style={{ 
            borderBottom: '1px solid #000', 
            display: 'inline-block',
            minWidth: '250px',
            paddingBottom: '2px'
          }}>{client.customerName}</span> agree that by signing this form, I will bring
          the following documents (stips) within 24 hours of the date of the Contract. If I fail to do so, I
          am aware that I may jeopardize my auto loan and forfeit any down payment and trade-in if
          applicable.
        </p>
      </div>

      {/* Spanish Section */}
      <div style={{ marginBottom: '30px' }}>
        <p style={{ 
          textAlign: 'justify', 
          lineHeight: '1.5',
          margin: '0'
        }}>
          Yo, <span style={{ 
            borderBottom: '1px solid #000', 
            display: 'inline-block',
            minWidth: '250px',
            paddingBottom: '2px'
          }}>{client.customerName}</span> al firmar esta forma, entiendo que es
          necesario presentar los documentos requeridos dentro de las próximas <u>24 horas de la firma
          del Contrato</u>. En caso de no presentarlos, podría perder el préstamo incluyendo el enganche
          y cualquier vehículo de intercambio.
        </p>
      </div>

      {/* Document Checklist */}
      <div style={{ marginBottom: '25px' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '11pt'
        }}>
          <tbody>
            {/* Row 1: Proof of Residence */}
            <tr>
              <td style={{ 
                width: '50%', 
                paddingRight: '20px',
                paddingBottom: '8px'
              }}>
                <CheckSymbol checked={isChecked('residence')} />
                <span>Proof of Residence</span>
              </td>
              <td style={{ 
                width: '50%', 
                paddingLeft: '20px',
                paddingBottom: '8px'
              }}>
                <CheckSymbol checked={isChecked('residence')} />
                <span>Comprobante de domicilio</span>
              </td>
            </tr>

            {/* Row 2: Proof of Income */}
            <tr>
              <td style={{ 
                width: '50%', 
                paddingRight: '20px',
                paddingBottom: '8px'
              }}>
                <CheckSymbol checked={isChecked('income')} />
                <span>Proof of Income</span>
              </td>
              <td style={{ 
                width: '50%', 
                paddingLeft: '20px',
                paddingBottom: '8px'
              }}>
                <CheckSymbol checked={isChecked('income')} />
                <span>Comprobante de Ingresos</span>
              </td>
            </tr>

            {/* Row 3: References */}
            <tr>
              <td style={{ 
                width: '50%', 
                paddingRight: '20px',
                paddingBottom: '8px'
              }}>
                <CheckSymbol checked={isChecked('references')} />
                <span>References References</span>
              </td>
              <td style={{ 
                width: '50%', 
                paddingLeft: '20px',
                paddingBottom: '8px'
              }}>
                <CheckSymbol checked={isChecked('references')} />
                <span>Referencias Solicitadas</span>
              </td>
            </tr>

            {/* Row 4: Driver License */}
            <tr>
              <td style={{ 
                width: '50%', 
                paddingRight: '20px',
                paddingBottom: '8px'
              }}>
                <CheckSymbol checked={isChecked('license')} />
                <span>Driver License or ID</span>
              </td>
              <td style={{ 
                width: '50%', 
                paddingLeft: '20px',
                paddingBottom: '8px'
              }}>
                <CheckSymbol checked={isChecked('license')} />
                <span>Licencia de Conducir o ID</span>
              </td>
            </tr>

            {/* Row 5: Insurance */}
            <tr>
              <td style={{ 
                width: '50%', 
                paddingRight: '20px',
                paddingBottom: '8px',
                verticalAlign: 'top'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '20px', verticalAlign: 'top' }}>
                        <CheckSymbol checked={isChecked('insurance')} />
                      </td>
                      <td style={{ verticalAlign: 'top' }}>
                        <div>Proof of Full Coverage Insurance</div>
                        <div style={{ paddingLeft: '10px', fontSize: '10pt' }}>$1000.00 Deductible</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td style={{ 
                width: '50%', 
                paddingLeft: '20px',
                paddingBottom: '8px',
                verticalAlign: 'top'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '20px', verticalAlign: 'top' }}>
                        <CheckSymbol checked={isChecked('insurance')} />
                      </td>
                      <td style={{ verticalAlign: 'top' }}>
                        <div>Seguro de Cobertura Amplia</div>
                        <div style={{ paddingLeft: '10px', fontSize: '10pt' }}>$1000.00 Deducible</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Note about document age */}
      <div style={{ 
        marginTop: '30px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <p style={{ 
          margin: '0 0 5px 0',
          fontSize: '10pt',
          fontWeight: 'bold'
        }}>
          All these documents must be current, no more than 30 days old.
        </p>
        <p style={{ 
          margin: '0',
          fontSize: '10pt',
          fontWeight: 'bold'
        }}>
          Todos los documentos deberán ser actuales, no más de 30 días de antigüedad.
        </p>
      </div>

      {/* Signature Section */}
      <div style={{ marginTop: '50px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ width: '50%', paddingRight: '20px' }}>
                <p style={{ margin: '0' }}>
                  Date/Fecha: <span style={{ 
                    borderBottom: '1px solid #000', 
                    display: 'inline-block',
                    width: '150px',
                    paddingBottom: '2px'
                  }}>{date}</span>
                </p>
              </td>
              <td style={{ width: '50%', paddingLeft: '20px' }}>
                <p style={{ margin: '0' }}>
                  Signature/Firma: <span style={{ 
                    borderBottom: '1px solid #000', 
                    display: 'inline-block',
                    width: '200px',
                    paddingBottom: '2px'
                  }}></span>
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
});

DocumentsPurchase.displayName = 'DocumentsPurchase';

export default DocumentsPurchase;