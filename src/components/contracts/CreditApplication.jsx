import { forwardRef } from 'react';

/**
 * Template del documento Credit Application / Datos de Financiamiento
 * Versión definitiva usando TABLAS para alineación perfecta en PDF
 */
const CreditApplication = forwardRef(({ client, date }, ref) => {
  const creditApp = client.creditApplication || {};

  // 🔧 FIX: Formatear fecha correctamente sin perder un día por UTC
  const formatDateLocal = (dateString) => {
    if (!dateString) return '';
    
    try {
      if (typeof dateString === 'string' && dateString.includes('-')) {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        });
      }
      
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
    } catch (error) {
      return '';
    }
  };

  // Estilos comunes para todas las tablas
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '3px'
  };

  const labelStyle = {
    fontSize: '9pt',
    padding: '0',
    paddingRight: '3px',
    verticalAlign: 'bottom',
    whiteSpace: 'nowrap'
  };

  const inputCellStyle = {
    borderBottom: '1px solid #000',
    padding: '0 3px 2px 3px',
    verticalAlign: 'bottom',
    fontSize: '9pt'
  };

  return (
    <div ref={ref} style={{
      width: '8.5in',
      minHeight: '11in',
      padding: '0.4in 0.6in',
      backgroundColor: 'white',
      fontFamily: 'Arial, sans-serif',
      fontSize: '9pt',
      color: '#000',
      boxSizing: 'border-box',
      margin: '0'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '18px' }}>
        <h1 style={{ 
          fontSize: '14pt', 
          fontWeight: 'bold', 
          margin: '0 0 5px 0',
          letterSpacing: '0.5px'
        }}>
          EL COMPA GUERO AUTO SALES LLC
        </h1>
        <p style={{ margin: '2px 0', fontSize: '8.5pt' }}>
          915 12TH ST SE, SALEM, OR 97302
        </p>
        <p style={{ margin: '2px 0', fontSize: '8.5pt' }}>
          PHONE: (503) 878 9550
        </p>
      </div>

      {/* ============================================ */}
      {/* Current Employment & Residence */}
      {/* ============================================ */}
      <div style={{ marginBottom: '14px' }}>
        <h2 style={{ 
          fontSize: '9.5pt', 
          fontWeight: 'bold', 
          marginBottom: '5px',
          borderBottom: '2px solid #000',
          paddingBottom: '2px'
        }}>
          Current Employment & Residence
        </h2>

        {/* Row 1: Name | Phone Number */}
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={labelStyle}>Name:</td>
              <td style={{...inputCellStyle, width: '48%'}}>{creditApp.name || ''}</td>
              <td style={{width: '20px'}}></td>
              <td style={labelStyle}>Phone Number:</td>
              <td style={{...inputCellStyle, width: '25%'}}>{creditApp.phone || ''}</td>
            </tr>
          </tbody>
        </table>

        {/* Row 2: DL# | Date of Birth */}
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={labelStyle}>DL#:</td>
              <td style={{...inputCellStyle, width: '35%'}}>{creditApp.dlNumber || ''}</td>
              <td style={{width: '40px'}}></td>
              <td style={labelStyle}>Date of Birth:</td>
              <td style={{...inputCellStyle, width: '25%'}}>{formatDateLocal(creditApp.dateOfBirth)}</td>
              <td style={{width: '40px'}}></td>
              <td style={labelStyle}>SSN:</td>
              <td style={{...inputCellStyle, width: '20%'}}>{creditApp.ssn ? `***-**-${creditApp.ssn}` : ''}</td>
            </tr>
          </tbody>
        </table>

        {/* Row 3: Address | Apt # */}
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={labelStyle}>Address:</td>
              <td style={{...inputCellStyle, width: '70%'}}>{creditApp.address || ''}</td>
              <td style={{width: '15px'}}></td>
              <td style={labelStyle}>Apt #:</td>
              <td style={{...inputCellStyle, width: '12%'}}>{creditApp.aptNumber || ''}</td>
            </tr>
          </tbody>
        </table>

        {/* Row 4: City, State | Zip, How Long */}
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={labelStyle}>City:</td>
              <td style={{...inputCellStyle, width: '25%'}}>{creditApp.city || ''}</td>
              <td style={{width: '15px'}}></td>
              <td style={labelStyle}>State:</td>
              <td style={{...inputCellStyle, width: '8%'}}>{creditApp.state || ''}</td>
              <td style={{width: '15px'}}></td>
              <td style={labelStyle}>Zip:</td>
              <td style={{...inputCellStyle, width: '12%'}}>{creditApp.zip || ''}</td>
              <td style={{width: '15px'}}></td>
              <td style={labelStyle}>How Long:</td>
              <td style={{...inputCellStyle, width: '6%', textAlign: 'center'}}>{creditApp.residenceYears || ''}</td>
              <td style={{...labelStyle, paddingLeft: '2px'}}>Yrs.</td>
              <td style={{...inputCellStyle, width: '6%', textAlign: 'center'}}>{creditApp.residenceMonths || ''}</td>
              <td style={{...labelStyle, paddingLeft: '2px'}}>Mon.</td>
            </tr>
          </tbody>
        </table>

        {/* Row 5: Mortgage/Landlord name | Landlord Phone */}
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={labelStyle}>Mortgage/Landlord name:</td>
              <td style={{...inputCellStyle, width: '42%'}}>{creditApp.landlordName || ''}</td>
              <td style={{width: '20px'}}></td>
              <td style={labelStyle}>Landlord Phone:</td>
              <td style={{...inputCellStyle, width: '25%'}}>{creditApp.landlordPhone || ''}</td>
            </tr>
          </tbody>
        </table>

        {/* Row 6: Monthly Payment */}
        <table style={{...tableStyle, marginBottom: '8px'}}>
          <tbody>
            <tr>
              <td style={labelStyle}>Monthly Payment:</td>
              <td style={{...inputCellStyle, width: '20%'}}>{creditApp.monthlyPayment ? `$${creditApp.monthlyPayment}` : ''}</td>
              <td style={{width: '60%'}}></td>
            </tr>
          </tbody>
        </table>

        {/* Employment Info */}
        {/* Row 7: Employer | Role */}
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={labelStyle}>Employer:</td>
              <td style={{...inputCellStyle, width: '45%'}}>{creditApp.employer || ''}</td>
              <td style={{width: '20px'}}></td>
              <td style={labelStyle}>Role:</td>
              <td style={{...inputCellStyle, width: '30%'}}>{creditApp.role || ''}</td>
            </tr>
          </tbody>
        </table>

        {/* Row 8: Supervisor | Employer Address */}
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={labelStyle}>Supervisor:</td>
              <td style={{...inputCellStyle, width: '35%'}}>{creditApp.supervisor || ''}</td>
              <td style={{width: '20px'}}></td>
              <td style={labelStyle}>Employer Address:</td>
              <td style={{...inputCellStyle, width: '35%'}}>{creditApp.employerAddress || ''}</td>
            </tr>
          </tbody>
        </table>

        {/* Row 9: City, State | Zip, How Long */}
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={labelStyle}>City:</td>
              <td style={{...inputCellStyle, width: '20%'}}>{creditApp.employerCity || ''}</td>
              <td style={{width: '15px'}}></td>
              <td style={labelStyle}>State:</td>
              <td style={{...inputCellStyle, width: '8%'}}>{creditApp.employerState || ''}</td>
              <td style={{width: '15px'}}></td>
              <td style={labelStyle}>Zip:</td>
              <td style={{...inputCellStyle, width: '12%'}}>{creditApp.employerZip || ''}</td>
              <td style={{width: '15px'}}></td>
              <td style={labelStyle}>How Long:</td>
              <td style={{...inputCellStyle, width: '6%', textAlign: 'center'}}>{creditApp.employmentYears || ''}</td>
              <td style={{...labelStyle, paddingLeft: '2px'}}>Yrs.</td>
              <td style={{...inputCellStyle, width: '6%', textAlign: 'center'}}>{creditApp.employmentMonths || ''}</td>
              <td style={{...labelStyle, paddingLeft: '2px'}}>Mon.</td>
            </tr>
          </tbody>
        </table>

        {/* Row 10: Phone Number | Monthly Income */}
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={labelStyle}>Phone Number:</td>
              <td style={{...inputCellStyle, width: '28%'}}>{creditApp.employerPhone || ''}</td>
              <td style={{width: '20px'}}></td>
              <td style={labelStyle}>Monthly Income (Gross):</td>
              <td style={{...inputCellStyle, width: '25%'}}>{creditApp.monthlyIncome ? `$${creditApp.monthlyIncome}` : ''}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ============================================ */}
      {/* Previous Residence and Previous or Secondary Employment */}
      {/* ============================================ */}
      <div style={{ marginBottom: '14px' }}>
        <h2 style={{ 
          fontSize: '9.5pt', 
          fontWeight: 'bold', 
          marginBottom: '5px',
          borderBottom: '2px solid #000',
          paddingBottom: '2px'
        }}>
          Previous Residence and Previous or Secondary Employment
        </h2>

        {/* Row 1: Name | Phone Number */}
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={labelStyle}>Name:</td>
              <td style={{...inputCellStyle, width: '48%'}}>{creditApp.prevName || ''}</td>
              <td style={{width: '20px'}}></td>
              <td style={labelStyle}>Phone Number:</td>
              <td style={{...inputCellStyle, width: '25%'}}>{creditApp.prevPhone || ''}</td>
            </tr>
          </tbody>
        </table>

        {/* Row 2: DL# | Date of Birth | SSN */}
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={labelStyle}>DL#:</td>
              <td style={{...inputCellStyle, width: '35%'}}>{creditApp.prevDlNumber || ''}</td>
              <td style={{width: '40px'}}></td>
              <td style={labelStyle}>Date of Birth:</td>
              <td style={{...inputCellStyle, width: '25%'}}>{formatDateLocal(creditApp.prevDateOfBirth)}</td>
              <td style={{width: '40px'}}></td>
              <td style={labelStyle}>SSN:</td>
              <td style={{...inputCellStyle, width: '20%'}}>{creditApp.prevSsn ? `***-**-${creditApp.prevSsn}` : ''}</td>
            </tr>
          </tbody>
        </table>

        {/* Row 3: Address | Apt # */}
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={labelStyle}>Address:</td>
              <td style={{...inputCellStyle, width: '70%'}}>{creditApp.prevAddress || ''}</td>
              <td style={{width: '15px'}}></td>
              <td style={labelStyle}>Apt #:</td>
              <td style={{...inputCellStyle, width: '12%'}}>{creditApp.prevAptNumber || ''}</td>
            </tr>
          </tbody>
        </table>

        {/* Row 4: City, State | Zip, How Long */}
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={labelStyle}>City:</td>
              <td style={{...inputCellStyle, width: '25%'}}>{creditApp.prevCity || ''}</td>
              <td style={{width: '15px'}}></td>
              <td style={labelStyle}>State:</td>
              <td style={{...inputCellStyle, width: '8%'}}>{creditApp.prevState || ''}</td>
              <td style={{width: '15px'}}></td>
              <td style={labelStyle}>Zip:</td>
              <td style={{...inputCellStyle, width: '12%'}}>{creditApp.prevZip || ''}</td>
              <td style={{width: '15px'}}></td>
              <td style={labelStyle}>How Long:</td>
              <td style={{...inputCellStyle, width: '6%', textAlign: 'center'}}>{creditApp.prevResidenceYears || ''}</td>
              <td style={{...labelStyle, paddingLeft: '2px'}}>Yrs.</td>
              <td style={{...inputCellStyle, width: '6%', textAlign: 'center'}}>{creditApp.prevResidenceMonths || ''}</td>
              <td style={{...labelStyle, paddingLeft: '2px'}}>Mon.</td>
            </tr>
          </tbody>
        </table>

        {/* Row 5: Mortgage/Landlord name | Landlord Phone */}
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={labelStyle}>Mortgage/Landlord name:</td>
              <td style={{...inputCellStyle, width: '42%'}}>{creditApp.prevLandlordName || ''}</td>
              <td style={{width: '20px'}}></td>
              <td style={labelStyle}>Landlord Phone:</td>
              <td style={{...inputCellStyle, width: '25%'}}>{creditApp.prevLandlordPhone || ''}</td>
            </tr>
          </tbody>
        </table>

        {/* Row 6: Monthly Payment */}
        <table style={{...tableStyle, marginBottom: '8px'}}>
          <tbody>
            <tr>
              <td style={labelStyle}>Monthly Payment:</td>
              <td style={{...inputCellStyle, width: '20%'}}>{creditApp.prevMonthlyPayment ? `$${creditApp.prevMonthlyPayment}` : ''}</td>
              <td style={{width: '60%'}}></td>
            </tr>
          </tbody>
        </table>

        {/* Previous Employment Info */}
        {/* Row 7: Employer | Role */}
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={labelStyle}>Employer:</td>
              <td style={{...inputCellStyle, width: '45%'}}>{creditApp.prevEmployer || ''}</td>
              <td style={{width: '20px'}}></td>
              <td style={labelStyle}>Role:</td>
              <td style={{...inputCellStyle, width: '30%'}}>{creditApp.prevRole || ''}</td>
            </tr>
          </tbody>
        </table>

        {/* Row 8: Supervisor | Employer Address */}
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={labelStyle}>Supervisor:</td>
              <td style={{...inputCellStyle, width: '35%'}}>{creditApp.prevSupervisor || ''}</td>
              <td style={{width: '20px'}}></td>
              <td style={labelStyle}>Employer Address:</td>
              <td style={{...inputCellStyle, width: '35%'}}>{creditApp.prevEmployerAddress || ''}</td>
            </tr>
          </tbody>
        </table>

        {/* Row 9: City, State | Zip, How Long */}
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={labelStyle}>City:</td>
              <td style={{...inputCellStyle, width: '20%'}}>{creditApp.prevEmployerCity || ''}</td>
              <td style={{width: '15px'}}></td>
              <td style={labelStyle}>State:</td>
              <td style={{...inputCellStyle, width: '8%'}}>{creditApp.prevEmployerState || ''}</td>
              <td style={{width: '15px'}}></td>
              <td style={labelStyle}>Zip:</td>
              <td style={{...inputCellStyle, width: '12%'}}>{creditApp.prevEmployerZip || ''}</td>
              <td style={{width: '15px'}}></td>
              <td style={labelStyle}>How Long:</td>
              <td style={{...inputCellStyle, width: '6%', textAlign: 'center'}}>{creditApp.prevEmploymentYears || ''}</td>
              <td style={{...labelStyle, paddingLeft: '2px'}}>Yrs.</td>
              <td style={{...inputCellStyle, width: '6%', textAlign: 'center'}}>{creditApp.prevEmploymentMonths || ''}</td>
              <td style={{...labelStyle, paddingLeft: '2px'}}>Mon.</td>
            </tr>
          </tbody>
        </table>

        {/* Row 10: Phone Number | Monthly Income */}
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={labelStyle}>Phone Number:</td>
              <td style={{...inputCellStyle, width: '28%'}}>{creditApp.prevEmployerPhone || ''}</td>
              <td style={{width: '20px'}}></td>
              <td style={labelStyle}>Monthly Income (Gross):</td>
              <td style={{...inputCellStyle, width: '25%'}}>{creditApp.prevMonthlyIncome ? `$${creditApp.prevMonthlyIncome}` : ''}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ============================================ */}
      {/* Credit Application Statements */}
      {/* ============================================ */}
      <div style={{ marginTop: '16px', marginBottom: '12px' }}>
        <h2 style={{ 
          fontSize: '9pt', 
          fontWeight: 'bold', 
          marginBottom: '4px'
        }}>
          Credit Application Statement / Addendum
        </h2>
        <p style={{ 
          fontSize: '7.5pt', 
          textAlign: 'justify', 
          lineHeight: '1.3',
          marginBottom: '6px'
        }}>
          Everything I have stated in this application is true and correct to the best of my knowledge. I understand that the Dealer may
          retain this application whether or not it is approved. I authorize you to check my credit and employment history and to answer
          questions about your credit with me. I also understand that, if I prefer, correspondence may be sent to me in Spanish.
        </p>

        <h2 style={{ 
          fontSize: '9pt', 
          fontWeight: 'bold', 
          marginBottom: '4px',
          marginTop: '10px'
        }}>
          Addendum to Credit Application
        </h2>
        <p style={{ 
          fontSize: '7.5pt', 
          textAlign: 'justify', 
          lineHeight: '1.3'
        }}>
          I, the undersigned, affirm that everything I have stated in this attached application is true and correct to the best of my
          knowledge. I understand that the Dealer and/or its assignees or potential assignees ("you") may retain the attached application
          and any other information provided to you, whether or not the application is approved. I authorize you to check my credit and
          employment history. I also authorize any person or consumer reporting agency to furnish you with any information it may have
          or obtain in response to your credit inquiries whenever made.
        </p>
      </div>

      {/* ============================================ */}
      {/* Signature Section */}
      {/* ============================================ */}
      <div style={{ marginTop: '20px' }}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <tbody>
            <tr>
              <td style={{width: '15%', fontSize: '9pt', paddingRight: '5px'}}>SIGNATURE:</td>
              <td style={{width: '45%', borderBottom: '1px solid #000', paddingBottom: '2px'}}></td>
              <td style={{width: '5%'}}></td>
              <td style={{width: '10%', fontSize: '9pt', paddingRight: '5px'}}>DATE:</td>
              <td style={{width: '25%', borderBottom: '1px solid #000', paddingBottom: '2px', paddingLeft: '3px'}}>{date}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
});

CreditApplication.displayName = 'CreditApplication';

export default CreditApplication;