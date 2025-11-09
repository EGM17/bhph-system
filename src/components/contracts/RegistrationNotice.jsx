import { forwardRef } from 'react';

/**
 * Template del contrato de Registration Fee Notice
 * Replica exactamente el formato del PDF original
 */
const RegistrationNotice = forwardRef(({ client, date }, ref) => {
  // Obtener últimos 6 dígitos del VIN para el Stock
  const stockNumber = client.vinNumber ? client.vinNumber.slice(-6) : '';

  // Formatear fecha
  const formattedDate = date || new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  return (
    <div ref={ref} style={{
      width: '8.5in',
      minHeight: '11in',
      padding: '0.5in 0.75in', // 0.5in arriba/abajo, 0.75in izquierda/derecha
      backgroundColor: 'white',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12pt',
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
          fontSize: '20pt', 
          fontWeight: 'bold', 
          margin: '0 0 15px 0',
          letterSpacing: '0.5px'
        }}>
          EL COMPA GUERO AUTO SALES LLC
        </h1>
        <p style={{ margin: '5px 0', fontSize: '11pt' }}>
          915 12th St SE, Salem, OR 97302
        </p>
        <p style={{ margin: '5px 0', fontSize: '11pt' }}>
          Phone: (503) 878 9550
        </p>
      </div>

      {/* Date */}
      <div style={{ marginBottom: '30px' }}>
        <p style={{ margin: '0' }}>
          Date: <span style={{ 
            borderBottom: '1px solid #000', 
            display: 'inline-block',
            minWidth: '200px',
            paddingBottom: '2px'
          }}>{formattedDate}</span>
        </p>
      </div>

      {/* Customer Info */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ margin: '10px 0' }}>
          Customer(s) Name: <span style={{ 
            borderBottom: '1px solid #000', 
            display: 'inline-block',
            minWidth: '450px',
            paddingBottom: '2px'
          }}>{client.customerName}</span>
        </p>
      </div>

      {/* Vehicle Info */}
      <div style={{ marginBottom: '30px' }}>
        <p style={{ margin: '10px 0' }}>
          Stock: <span style={{ 
            borderBottom: '1px solid #000', 
            display: 'inline-block',
            minWidth: '80px',
            paddingBottom: '2px'
          }}>{stockNumber}</span>
          {' '}Year: <span style={{ 
            borderBottom: '1px solid #000', 
            display: 'inline-block',
            minWidth: '60px',
            paddingBottom: '2px'
          }}>{client.vehicleYear}</span>
          {' '}Make: <span style={{ 
            borderBottom: '1px solid #000', 
            display: 'inline-block',
            minWidth: '100px',
            paddingBottom: '2px'
          }}>{client.vehicleMake}</span>
          {' '}Model: <span style={{ 
            borderBottom: '1px solid #000', 
            display: 'inline-block',
            minWidth: '120px',
            paddingBottom: '2px'
          }}>{client.vehicleModel}</span>
        </p>
      </div>

      {/* English Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ 
          fontSize: '13pt', 
          fontWeight: 'bold', 
          textAlign: 'center',
          margin: '20px 0'
        }}>
          Registration Fee:
        </h2>
        <p style={{ 
          textAlign: 'justify', 
          lineHeight: '1.6',
          margin: '0 0 30px 0'
        }}>
          This notice is to inform you that your vehicle registration is NOT included in your loan. 
          The vehicle registration fee is due 15 days from your sale date. You will receive a phone 
          call prior to the due date informing you of the exact cost of your vehicle registration fee.
        </p>

        {/* Signature lines - English */}
        <div style={{ marginTop: '40px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ width: '50%', paddingRight: '20px' }}>
                  <p style={{ margin: '0' }}>
                    Signature: <span style={{ 
                      borderBottom: '1px solid #000', 
                      display: 'inline-block',
                      width: '200px',
                      paddingBottom: '2px'
                    }}></span>
                  </p>
                </td>
                <td style={{ width: '50%', paddingLeft: '20px' }}>
                  <p style={{ margin: '0' }}>
                    Signature: <span style={{ 
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

      {/* Spanish Section */}
      <div style={{ marginTop: '50px' }}>
        <h2 style={{ 
          fontSize: '13pt', 
          fontWeight: 'bold', 
          textAlign: 'center',
          margin: '20px 0'
        }}>
          Costo de registro
        </h2>
        <p style={{ 
          textAlign: 'justify', 
          lineHeight: '1.6',
          margin: '0 0 30px 0'
        }}>
          La presente es para informarle que el registro de su vehículo NO está incluido en el 
          préstamo. La cuota de registro del vehículo se debe 15 días a partir de la fecha de venta. 
          Usted recibirá una llamada telefónica antes de la fecha de vencimiento para informarle 
          el costo exacto de la registración de su vehículo.
        </p>

        {/* Signature lines - Spanish */}
        <div style={{ marginTop: '40px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ width: '50%', paddingRight: '20px' }}>
                  <p style={{ margin: '0' }}>
                    Firma: <span style={{ 
                      borderBottom: '1px solid #000', 
                      display: 'inline-block',
                      width: '220px',
                      paddingBottom: '2px'
                    }}></span>
                  </p>
                </td>
                <td style={{ width: '50%', paddingLeft: '20px' }}>
                  <p style={{ margin: '0' }}>
                    Firma: <span style={{ 
                      borderBottom: '1px solid #000', 
                      display: 'inline-block',
                      width: '220px',
                      paddingBottom: '2px'
                    }}></span>
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

RegistrationNotice.displayName = 'RegistrationNotice';

export default RegistrationNotice;