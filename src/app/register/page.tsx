'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { registerUser } from '../../services/authService';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    acceptTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // Multi-step form

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) return 'Nome é obrigatório';
    if (!formData.email.trim()) return 'Email é obrigatório';
    if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Email inválido';
    return null;
  };

  const validateStep2 = () => {
    if (formData.password.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
    if (formData.password !== formData.confirmPassword) return 'Senhas não coincidem';
    if (!formData.acceptTerms) return 'Você deve aceitar os termos de uso';
    return null;
  };

  const handleNext = () => {
    const error = validateStep1();
    if (error) {
      setError(error);
      return;
    }
    setError('');
    setStep(2);
  };

  const handleBack = () => {
    setError('');
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateStep2();
    if (error) {
      setError(error);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Use the auth service to register
      const userProfile = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      });
      
      console.log('Registration successful:', userProfile);
      
      // Redirect to dashboard on success
      window.location.href = '/dashboard/houses';
    } catch (error: any) {
      setError(error.message || 'Erro ao criar conta');
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
          <h1 className="auth-title">Criar Conta</h1>
          <p className="auth-subtitle">
            {step === 1 ? 'Vamos começar com suas informações básicas' : 'Finalize sua conta'}
          </p>
          
          {/* Progress Indicator */}
          <div className="progress-container">
            <div className="progress-bar">
              <div className={`progress-fill ${step === 2 ? 'complete' : ''}`}></div>
            </div>
            <div className="progress-steps">
              <span className={`step ${step >= 1 ? 'active' : ''}`}>1</span>
              <span className={`step ${step >= 2 ? 'active' : ''}`}>2</span>
            </div>
          </div>
        </div>

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
            <>
              <div className="form-group">
                <label className="form-label">Nome completo</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Seu nome completo"
                  className="form-input"
                  required
                />
              </div>

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
                <label className="form-label">Telefone (opcional)</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                  className="form-input"
                />
              </div>

              <button type="submit" className="auth-button primary">
                Continuar
              </button>
            </>
          )}

          {step === 2 && (
            <>
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
                <small className="input-hint">Mínimo 6 caracteres</small>
              </div>

              <div className="form-group">
                <label className="form-label">Confirmar senha</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
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
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                    className="checkbox-input"
                    required
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-text">
                    Aceito os{' '}
                    <a href="/terms" target="_blank" className="terms-link">
                      termos de uso
                    </a>{' '}
                    e{' '}
                    <a href="/privacy" target="_blank" className="terms-link">
                      política de privacidade
                    </a>
                  </span>
                </label>
              </div>

              <div className="button-group">
                <button type="button" onClick={handleBack} className="auth-button secondary">
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="auth-button primary"
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Criando conta...
                    </>
                  ) : (
                    'Criar Conta'
                  )}
                </button>
              </div>
            </>
          )}
        </form>

        <div className="auth-footer">
          <p className="footer-text">
            Já tem uma conta?{' '}
            <Link href="/login" className="footer-link">
              Entrar
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
          max-width: 420px;
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
          margin-bottom: 16px;
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
          margin: 0 0 24px 0;
        }

        .progress-container {
          position: relative;
          margin-bottom: 8px;
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          background: #e1e5e9;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #0085ff;
          width: 50%;
          transition: width 0.3s ease;
        }

        .progress-fill.complete {
          width: 100%;
        }

        .progress-steps {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
        }

        .step {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #e1e5e9;
          color: #676879;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .step.active {
          background: #0085ff;
          color: white;
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

        .input-hint {
          display: block;
          font-size: 12px;
          color: #676879;
          margin-top: 4px;
        }

        .checkbox-group {
          margin-bottom: 24px;
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
          color: #323338;
          line-height: 1.4;
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
          flex-shrink: 0;
          margin-top: 1px;
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

        .terms-link {
          color: #0085ff;
          text-decoration: none;
        }

        .terms-link:hover {
          text-decoration: underline;
        }

        .button-group {
          display: flex;
          gap: 12px;
        }

        .auth-button {
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
          flex: 1;
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

        .auth-button.secondary {
          background: transparent;
          color: #676879;
          border: 2px solid #d0d4d9;
        }

        .auth-button.secondary:hover {
          border-color: #0085ff;
          color: #0085ff;
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

          .button-group {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}