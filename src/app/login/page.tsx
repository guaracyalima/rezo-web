'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { loginUser } from '../../services/authService';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Use the auth service to login
      const userProfile = await loginUser({
        email: formData.email,
        password: formData.password
      });
      
      console.log('Login successful:', userProfile);
      
      // Check if there's a redirect URL saved after login
      const redirectAfterLogin = sessionStorage.getItem('redirectAfterLogin');
      
      if (redirectAfterLogin) {
        // Clear the redirect URL and redirect to the saved page
        sessionStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectAfterLogin;
      } else {
        // Default redirect to dashboard
        window.location.href = '/dashboard/houses';
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-icon">🕉️</span>
            <span className="logo-text">Rezo Web</span>
          </div>
          <h1 className="auth-title">Bem-vindo de volta</h1>
          <p className="auth-subtitle">Entre em sua conta para continuar</p>
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
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="seu@email.com"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="form-input"
              required
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="checkbox-input"
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-text">Lembrar de mim</span>
            </label>
            <Link href="/forgot-password" className="forgot-link">
              Esqueceu a senha?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button primary"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="footer-text">
            Não tem uma conta?{' '}
            <Link href="/register" className="footer-link">
              Criar conta
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

        .error-icon {
          font-size: 16px;
        }

        .form-group {
          margin-bottom: 20px;
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

        .checkbox-group {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
          color: #323338;
        }

        .checkbox-input {
          display: none;
        }

        .checkbox-custom {
          width: 18px;
          height: 18px;
          border: 2px solid #d0d4d9;
          border-radius: 4px;
          position: relative;
          transition: all 0.2s ease;
        }

        .checkbox-input:checked + .checkbox-custom {
          background: #0085ff;
          border-color: #0085ff;
        }

        .checkbox-input:checked + .checkbox-custom::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        .checkbox-text {
          font-size: 14px;
          color: #323338;
        }

        .forgot-link {
          font-size: 14px;
          color: #0085ff;
          text-decoration: none;
          font-weight: 500;
        }

        .forgot-link:hover {
          text-decoration: underline;
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