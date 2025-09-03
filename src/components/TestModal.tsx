import React from 'react';

interface TestModalProps {
  onClose: () => void;
}

const TestModal: React.FC<TestModalProps> = ({ onClose }) => {
  console.log('🧪 TestModal rendered successfully!');
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <h2 style={{ color: '#28a745', marginBottom: '20px' }}>🎉 Modal Funcionando!</h2>
        <p style={{ marginBottom: '20px' }}>
          Se você está vendo esta mensagem, o sistema de modal está funcionando corretamente.
        </p>
        <button
          onClick={onClose}
          style={{
            background: '#007bff',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

export default TestModal;