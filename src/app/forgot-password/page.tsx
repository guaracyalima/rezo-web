'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { resetPassword } from '../../services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email é obrigatório');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email inválido');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Use the auth service to reset password
      await resetPassword(email);
      setSuccess(true);
    } catch (error: any) {
      setError(error.message || 'Erro ao enviar email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="success-icon">✅</div>
            <h1 className="auth-title">Email Enviado!</h1>
            <p className="auth-subtitle">
              Enviamos um link de recuperação para <strong>{email}</strong>
            </p>
          </div>

          <div className="success-content">
            <div className="instruction-box">
              <h3 className="instruction-title">Próximos passos:</h3>
              <ul className="instruction-list">
                <li>Verifique sua caixa de entrada</li>
                <li>Clique no link de recuperação</li>
                <li>Crie uma nova senha</li>
                <li>Faça login com sua nova senha</li>
              </ul>
            </div>

            <p className="help-text">
              Não recebeu o email? Verifique sua pasta de spam ou{' '}
              <button 
                onClick={() => { setSuccess(false); setEmail(''); }}
                className="retry-link"
              >
                tente novamente
              </button>
            </p>

            <Link href="/login" className="auth-button primary">
              Voltar ao Login
            </Link>
          </div>
        </div>

        <style jsx>{`
          .auth-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          .auth-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            width: 100%;
            max-width: 400px;
            padding: 40px;
            text-align: center;
          }

          .success-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }

          .auth-title {
            font-size: 28px;
            font-weight: 600;
            color: #323338;
            margin: 0 0 12px 0;
          }

          .auth-subtitle {
            color: #676879;
            font-size: 16px;
            margin: 0 0 32px 0;
            line-height: 1.5;
          }

          .instruction-box {
            background: #f5f6f8;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 24px;
            text-align: left;
          }

          .instruction-title {
            font-size: 16px;
            font-weight: 600;
            color: #323338;
            margin: 0 0 12px 0;
          }

          .instruction-list {
            margin: 0;
            padding-left: 20px;
            color: #676879;
            font-size: 14px;
            line-height: 1.6;
          }

          .instruction-list li {
            margin-bottom: 4px;
          }

          .help-text {
            color: #676879;
            font-size: 14px;
            margin-bottom: 24px;
            line-height: 1.5;
          }

          .retry-link {
            background: none;
            border: none;
            color: #0085ff;
            text-decoration: underline;
            cursor: pointer;
            font-size: inherit;
            padding: 0;
          }

          .auth-button {
            width: 100%;
            padding: 14px 20px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            display: inline-block;
            text-align: center;
          }

          .auth-button.primary {
            background: #0085ff;
            color: white;
          }

          .auth-button.primary:hover {
            background: #0073e6;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 133, 255, 0.3);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-icon">🕉️</span>
            <span className="logo-text">Rezo Web</span>
          </div>
          <h1 className="auth-title">Esqueceu a senha?</h1>
          <p className="auth-subtitle">
            Digite seu email e enviaremos um link para redefinir sua senha
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="form-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button primary"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Enviando...
              </>
            ) : (
              'Enviar Link de Recuperação'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="footer-text">
            Lembrou da senha?{' '}
            <Link href="/login" className="footer-link">
              Voltar ao login
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .auth-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          width: 100%;
          max-width: 400px;
          padding: 40px;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .auth-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 24px;
        }

        .logo-icon {
          font-size: 32px;
        }

        .logo-text {
          font-size: 24px;
          font-weight: 700;
          color: #323338;
        }

        .auth-title {
          font-size: 28px;
          font-weight: 600;
          color: #323338;
          margin: 0 0 8px 0;
        }

        .auth-subtitle {
          color: #676879;
          font-size: 16px;
          margin: 0;
          line-height: 1.5;
        }

        .auth-form {
          margin-bottom: 24px;
        }

        .error-message {
          background: #fee;
          border: 1px solid #fcc;
          color: #c33;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #323338;
          margin-bottom: 6px;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #d0d4d9;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.2s ease;
          background: white !important;
          color: #323338 !important;
          -webkit-text-fill-color: #323338 !important;
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: #0085ff;
          box-shadow: 0 0 0 3px rgba(0, 133, 255, 0.1);
        }

        .form-input:-webkit-autofill,
        .form-input:-webkit-autofill:hover,
        .form-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px white inset !important;
          -webkit-text-fill-color: #323338 !important;
          background-color: white !important;
        }

        .auth-button {
          width: 100%;
          padding: 14px 20px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .auth-button.primary {
          background: #0085ff;
          color: white;
        }

        .auth-button.primary:hover:not(:disabled) {
          background: #0073e6;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 133, 255, 0.3);
        }

        .auth-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .auth-footer {
          text-align: center;
          padding-top: 24px;
          border-top: 1px solid #e1e5e9;
        }

        .footer-text {
          color: #676879;
          font-size: 14px;
          margin: 0;
        }

        .footer-link {
          color: #0085ff;
          text-decoration: none;
          font-weight: 500;
        }

        .footer-link:hover {
          text-decoration: underline;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 480px) {
          .auth-card {
            padding: 24px;
            margin: 16px;
          }

          .auth-title {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}