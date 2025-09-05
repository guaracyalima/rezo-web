import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { CreateHouseData } from '../../../services/housesService';
import { createHouse, createHouseWallet, checkEmailExists, checkDocumentExists } from '../../../services/housesService';
import styles from './HouseForm.module.css';
import {
  formatDocument,
  formatPhone,
  formatCEP,
  formatCPF,
  removeMask,
  validateDocument,
  validatePhone,
  validateCEP,
  validateCPF,
  validateName,
  brazilianStates,
  fetchAddressByCEP
} from '../../../utils/formatters';
import { log } from 'console';

interface HouseFormProps {
  isEdit?: boolean;
  houseId?: string;
  onSuccess?: (houseId: string) => void;
  onCancel?: () => void;
}

const HouseForm: React.FC<HouseFormProps> = ({ 
  isEdit = false, 
  houseId, 
  onSuccess, 
  onCancel 
}) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<CreateHouseData & { companyType?: string }>({
    name: '',
    description: '',
    shortDescription: '',
    email: '',
    phone: '',
    mobilePhone: '',
    website: '',
    
    leader: {
      name: '',
      contact: '', // email
      cpf: '',
      mobilePhone: '',
      address: '',
      addressNumber: '',
      complement: '',
      province: '', // bairro
      postalCode: '',
      birthDate: ''
    },
    
    location: {
      address: '',
      addressNumber: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Brasil'
    },
    
    // Business options
    allowBookings: false,
    allowEvents: false,
    allowShop: false,
    
    // Business info
    businessDocument: '',
    incomeValue: 0,
    
    // Logo obrigatório
    logo: '',
    
    images: [],
    tags: [],
    isPublic: true,
    requiresApproval: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [leaderPhotoFile, setLeaderPhotoFile] = useState<File | null>(null);

  // Mock data para cultos
  const cults = ['Umbanda', 'Candomblé', 'Kardecismo', 'Quimbanda'];

  const steps = [
    { id: 1, title: '', icon: '🏠' },
    { id: 2, title: '', icon: '👤' },
    { id: 3, title: '', icon: '📍' }
  ];

  useEffect(() => {
    if (isEdit && houseId) {
      loadHouse();
    }
  }, [isEdit, houseId]);

  const loadHouse = async () => {
    // Simplified for now - edit mode not fully implemented
    console.log('Edit mode loading...');
  };

  // Validation functions
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        return !validateName(value) ? 'Nome deve ter pelo menos 3 caracteres' : '';
      case 'leader.name':
        return !validateName(value) ? 'Nome do dirigente deve ter pelo menos 3 caracteres' : '';
      case 'businessDocument':
        return value && !validateDocument(value) ? 'CPF/CNPJ inválido' : '';
      case 'leader.cpf':
        return value && !validateCPF(value) ? 'CPF inválido' : '';
      case 'leader.mobilePhone':
        return value && !validatePhone(value) ? 'Telefone inválido' : '';
      case 'mobilePhone':
        return value && !validatePhone(value) ? 'Telefone inválido' : '';
      case 'location.postalCode':
      case 'leader.postalCode':
        return value && !validateCEP(value) ? 'CEP inválido' : '';
      default:
        return '';
    }
  };

  // Função para validar email único
  const handleEmailBlur = async () => {
    if (formData.email && formData.email.trim()) {
      try {
        const exists = await checkEmailExists(formData.email);
        if (exists) {
          Swal.fire({
            icon: 'warning',
            title: 'Email já cadastrado',
            text: 'Este email já está sendo utilizado por outra casa.',
            confirmButtonText: 'OK'
          });
          setFormData(prev => ({ ...prev, email: '' }));
          setErrors(prev => ({ ...prev, email: 'Este email já está sendo utilizado' }));
        } else {
          setErrors(prev => ({ ...prev, email: '' }));
        }
      } catch (error) {
        console.error('Erro ao verificar email:', error);
      }
    }
  };

  // Função para validar documento único
  const handleDocumentBlur = async () => {
    console.log("cabeca d eminha pica");
    
    if (formData.businessDocument && formData.businessDocument.trim()) {
      try {
        const cleanDocument = removeMask(formData.businessDocument);
        const exists = await checkDocumentExists(cleanDocument);
        if (exists) {
          Swal.fire({
            icon: 'warning',
            title: 'Documento já cadastrado',
            text: 'Este CPF/CNPJ já está sendo utilizado por outra casa.',
            confirmButtonText: 'OK'
          });
          setFormData(prev => ({ ...prev, businessDocument: '' }));
          setErrors(prev => ({ ...prev, businessDocument: 'Este documento já está sendo utilizado' }));
        } else {
          setErrors(prev => ({ ...prev, businessDocument: '' }));
        }
      } catch (error) {
        console.error('Erro ao verificar documento:', error);
      }
    }
  };

  // Handle input changes with masks
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        if (parent === 'leader') {
          return {
            ...prev,
            leader: {
              ...prev.leader,
              [child]: value
            }
          };
        } else if (parent === 'location') {
          return {
            ...prev,
            location: {
              ...prev.location,
              [child]: value
            }
          };
        }
        return prev;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'gallery' | 'leaderPhoto') => {
    const files = e.target.files;
    if (!files) return;

    switch (type) {
      case 'logo':
        setLogoFile(files[0]);
        break;
      case 'leaderPhoto':
        setLeaderPhotoFile(files[0]);
        break;
    }
  };

  // Handle leader photo upload (required)
  const handleLeaderPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setLeaderPhotoFile(files[0]);
    }
  };

  // Handle logo upload (required)
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setLogoFile(files[0]);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          logo: e.target?.result as string
        }));
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const uploadFiles = async (houseId: string): Promise<CreateHouseData> => {
    // Simplified for now - file upload not implemented
    console.log('File upload not implemented yet');
    return formData;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrors({}); // Limpar erros anteriores

    try {
      setLoading(true);
      setUploading(true);

      // Verificar duplicatas antes de criar (apenas se não foram verificadas antes)
      if (formData.email && !errors.email) {
        const emailExists = await checkEmailExists(formData.email);
        if (emailExists) {
          setError('Este email já está sendo utilizado por outra casa.');
          setErrors(prev => ({ ...prev, email: 'Este email já está sendo utilizado' }));
          setLoading(false);
          setUploading(false);
          return;
        }
      }

      if (formData.businessDocument && !errors.businessDocument) {
        const cleanDocument = removeMask(formData.businessDocument);
        const documentExists = await checkDocumentExists(cleanDocument);
        if (documentExists) {
          setError('Este CPF/CNPJ já está sendo utilizado por outra casa.');
          setErrors(prev => ({ ...prev, businessDocument: 'Este documento já está sendo utilizado' }));
          setLoading(false);
          setUploading(false);
          return;
        }
      }

      // Remove masks before saving
      const cleanFormData: any = {
        name: formData.name,
        description: formData.description,
        shortDescription: formData.shortDescription,
        email: formData.email,
        phone: formData.phone ? removeMask(formData.phone) : '',
        mobilePhone: formData.mobilePhone ? removeMask(formData.mobilePhone) : '',
        website: formData.website,
        
        leader: {
          name: formData.leader.name,
          contact: formData.leader.contact,
          cpf: formData.leader.cpf ? removeMask(formData.leader.cpf) : '',
          mobilePhone: formData.leader.mobilePhone ? removeMask(formData.leader.mobilePhone) : '',
          address: formData.leader.address,
          addressNumber: formData.leader.addressNumber,
          complement: formData.leader.complement || '',
          province: formData.leader.province,
          postalCode: formData.leader.postalCode ? removeMask(formData.leader.postalCode) : '',
          birthDate: formData.leader.birthDate
        },
        
        location: {
          address: formData.location.address,
          addressNumber: formData.location.addressNumber,
          complement: formData.location.complement || '',
          neighborhood: formData.location.neighborhood,
          city: formData.location.city,
          state: formData.location.state,
          postalCode: formData.location.postalCode ? removeMask(formData.location.postalCode) : '',
          country: formData.location.country
        },
        
        // Business options
        allowBookings: formData.allowBookings,
        allowEvents: formData.allowEvents,
        allowShop: formData.allowShop,
        
        // Business info - only include if they have values
        businessDocument: formData.businessDocument ? removeMask(formData.businessDocument) : '',
        incomeValue: formData.incomeValue || 0,
        
        // Visual
        logo: formData.logo,
        images: formData.images || [],
        
        // Meta
        tags: formData.tags || [],
        isPublic: formData.isPublic,
        requiresApproval: formData.requiresApproval
      };

      // Only add companyType if it has a valid value (not empty string or undefined)
      if (formData.companyType && formData.companyType.trim() !== '') {
        cleanFormData.companyType = formData.companyType;
      }

      console.log('📤 Data being sent to Firestore:', cleanFormData);

      if (isEdit && houseId) {
        // For edit mode - simplified for now
        console.log('Edit mode not fully implemented yet');
        if (onSuccess) {
          onSuccess(houseId);
        }
      } else {
        // Create new house
        const newHouseId = await createHouse(cleanFormData);
        
        console.log('✅ House created with ID:', newHouseId);
        
        // Create wallet if business services are enabled
        if (formData.allowBookings || formData.allowShop || formData.allowEvents) {
          try {
            console.log('🏦 Creating Asaas wallet for business services...');
            await createHouseWallet(newHouseId, cleanFormData, 'current-user-id');
            console.log('✅ Asaas wallet created successfully');
          } catch (walletError) {
            console.error('❌ Error creating wallet (house still created):', walletError);
            // Don't fail the house creation if wallet creation fails
          }
        }
        
        if (onSuccess) {
          onSuccess(newHouseId);
        }
      }
    } catch (error: any) {
      console.error('Error saving house:', error);
      setError(error.message || 'Erro ao salvar casa');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  // Function to handle business services toggle with confirmation
  const handleBusinessServiceToggle = async (serviceName: 'allowBookings' | 'allowEvents' | 'allowShop', checked: boolean) => {
    if (checked) {
      // Show confirmation dialog
      const result = await Swal.fire({
        title: '💳 Conta Comercial Asaas',
        html: `
          <div style="text-align: left;">
            <p><strong>Para habilitar este serviço, será criada uma conta comercial no gateway Asaas para que sua casa possa receber pagamentos.</strong></p>
            
            <h4>🏦 O que acontecerá:</h4>
            <ul>
              <li>✅ Conta bancária digital gratuita</li>
              <li>✅ Recebimento via PIX, cartão e boleto</li>
              <li>✅ Gestão financeira completa</li>
              <li>✅ App móvel para acompanhamento</li>
            </ul>
            
            <h4>📱 App Asaas:</h4>
            <p>Baixe o aplicativo para gerenciar sua conta:</p>
            <div style="display: flex; gap: 10px; justify-content: center; margin: 10px 0;">
              <a href="https://play.google.com/store/apps/details?id=com.asaas.pay" target="_blank" style="text-decoration: none;">
                📱 Android
              </a>
              <a href="https://apps.apple.com/br/app/asaas/id1473011315" target="_blank" style="text-decoration: none;">
                🍎 iOS
              </a>
            </div>
            
            <p><small>A criação da conta é <strong>gratuita</strong> e será feita automaticamente com os dados informados.</small></p>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#0085ff',
        cancelButtonColor: '#dc3545',
        confirmButtonText: 'Sim, criar conta Asaas',
        cancelButtonText: 'Cancelar',
        width: 600
      });

      if (result.isConfirmed) {
        // Enable the service and all other services
        setFormData(prev => ({
          ...prev,
          [serviceName]: true,
          allowBookings: true,
          allowEvents: true,
          allowShop: true
        }));
      }
    } else {
      // Disable all services if unchecking
      setFormData(prev => ({
        ...prev,
        allowBookings: false,
        allowEvents: false,
        allowShop: false
      }));
    }
  };

  // Function to check if business document is CNPJ
  const isCNPJ = (document: string | undefined) => {
    if (!document) return false;
    return document.replace(/\D/g, '').length === 14;
  };

  // Function to handle gallery file preview
  // Function to validate current step
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    console.log("\n\n\n\n PORRA DO CARALHO \n\n\n")
    switch (currentStep) {
      case 1:
        // Validações Step 1: Informações e Serviços
        if (!validateName(formData.name)) {
          newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
        }
        
        if (!formData.logo && !logoFile) {
          newErrors.logo = 'Logo da casa é obrigatória';
        }
        
        // Validações condicionais para serviços de negócio
        if (formData.allowBookings || formData.allowShop || formData.allowEvents) {
          if (!formData.businessDocument) {
            newErrors.businessDocument = 'Documento da casa é obrigatório quando serviços são habilitados';
          } else if (!validateDocument(formData.businessDocument)) {
            newErrors.businessDocument = 'CPF/CNPJ inválido';
          }
          
          if (!formData.mobilePhone) {
            newErrors.mobilePhone = 'Telefone celular é obrigatório quando serviços são habilitados';
          } else if (!validatePhone(formData.mobilePhone)) {
            newErrors.mobilePhone = 'Telefone inválido';
          }
          
          // Validação específica para CNPJ
          if (formData.businessDocument && isCNPJ(formData.businessDocument)) {
            if (!formData.companyType) {
              newErrors.companyType = 'Tipo de empresa é obrigatório para CNPJ';
            }
          }
        }
        break;
        
      case 2:
        // Validações Step 2: Informações do Dirigente
        if (!validateName(formData.leader.name)) {
          newErrors['leader.name'] = 'Nome do dirigente deve ter pelo menos 3 caracteres';
        }
        
        if (!leaderPhotoFile) {
          newErrors['leader.photo'] = 'Foto do dirigente é obrigatória';
        }
        
        if (formData.leader.cpf && !validateCPF(formData.leader.cpf)) {
          newErrors['leader.cpf'] = 'CPF inválido';
        }
        
        if (formData.leader.mobilePhone && !validatePhone(formData.leader.mobilePhone)) {
          newErrors['leader.mobilePhone'] = 'Telefone inválido';
        }
        
        if (formData.leader.postalCode && !validateCEP(formData.leader.postalCode)) {
          newErrors['leader.postalCode'] = 'CEP inválido';
        }
        break;
        
      case 3:
        // Validações Step 3: Endereço da Casa
        if (!formData.location.address) {
          newErrors['location.address'] = 'Endereço é obrigatório';
        }
        
        if (!formData.location.addressNumber) {
          newErrors['location.addressNumber'] = 'Número é obrigatório';
        }
        
        if (!formData.location.neighborhood) {
          newErrors['location.neighborhood'] = 'Bairro é obrigatório';
        }
        
        if (!formData.location.city) {
          newErrors['location.city'] = 'Cidade é obrigatória';
        }
        
        if (!formData.location.state) {
          newErrors['location.state'] = 'Estado é obrigatório';
        }
        
        if (formData.location.postalCode && !validateCEP(formData.location.postalCode)) {
          newErrors['location.postalCode'] = 'CEP inválido';
        }
        break;
    }
    
    // Se houver erros, mostrar e retornar false
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const errorMessages = Object.values(newErrors);
      setError(`Corrija os seguintes campos: ${errorMessages.join(', ')}`);
      return false;
    }
    
    // Limpar erros se validação passou
    setErrors({});
    setError('');
    return true;
  };

  // Function to navigate steps
  const nextStep = () => {
    // Validar step atual antes de avançar
    if (!validateCurrentStep()) {
      return; // Não avança se há erros
    }
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Function to render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className={styles.stepContent}>
            <h3>Informações da casa</h3>
            <p>Dados básicos da casa</p>
            
            {/* Logo da Casa */}
            <div className={styles.formGroup}>
              <label>Logo da Casa <span className={styles.required}>*</span></label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className={styles.fileInput}
                required={!formData.logo}
              />
              {formData.logo && (
                <div style={{ marginTop: '10px' }}>
                  <img 
                    src={formData.logo} 
                    alt="Logo da Casa" 
                    style={{ 
                      width: '120px', 
                      height: '120px', 
                      borderRadius: '8px', 
                      objectFit: 'cover',
                      border: '2px solid #e1e5e9'
                    }} 
                  />
                </div>
              )}
              {errors.logo && (
                <div className={styles.validationError}>{errors.logo}</div>
              )}
            </div>
            
            <div className={styles.formGroup}>
              <label>Nome da Casa <span className={styles.required}>*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ex: Centro Espírita Paz e Amor"
                required
                className={errors.name ? styles.errorInput : ''}
              />
              {errors.name && (
                <div className={styles.validationError}>{errors.name}</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Descrição da Casa <span className={styles.required}>*</span></label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                placeholder="Descreva a casa, suas práticas, história..."
                rows={4}
                required
                className={errors.description ? styles.errorInput : ''}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Email da Casa <span className={styles.required}>*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleEmailBlur}
                  placeholder="contato@casaespiritual.com"
                  required
                  className={errors.email ? styles.errorInput : ''}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Telefone da Casa</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={(e) => {
                    const maskedValue = formatPhone(e.target.value);
                    setFormData(prev => ({ ...prev, phone: maskedValue }));
                  }}
                  placeholder="(85) 3333-4444"
                />
              </div>
            </div>

             {/* Informações Comerciais - Aparecem quando serviços habilitados */}
            {(formData.allowBookings || formData.allowShop || formData.allowEvents) && (
              <div className={styles.businessInfoSection}>
                <h4>📄 Informações Comerciais</h4>
                <p className={styles.sectionDescription}>
                  Para vender produtos ou serviços, precisamos de algumas informações adicionais.
                </p>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Documento da Casa (CPF/CNPJ) <span className={styles.required}>*</span></label>
                    <input
                      type="text"
                      name="businessDocument"
                      value={formData.businessDocument || ''}
                      onChange={(e) => {
                        const maskedValue = formatDocument(e.target.value);
                        setFormData(prev => ({ ...prev, businessDocument: maskedValue }));
                      }}
                      onBlur={handleDocumentBlur}
                      placeholder="000.000.000-00 ou 00.000.000/0001-00"
                      required
                      className={errors.businessDocument ? styles.errorInput : ''}
                    />
                    {errors.businessDocument && (
                      <div className={styles.validationError}>{errors.businessDocument}</div>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Telefone Celular da Casa <span className={styles.required}>*</span></label>
                    <input
                      type="tel"
                      name="mobilePhone"
                      value={formData.mobilePhone || ''}
                      onChange={(e) => {
                        const maskedValue = formatPhone(e.target.value);
                        setFormData(prev => ({ ...prev, mobilePhone: maskedValue }));
                      }}
                      placeholder="(85) 99999-9999"
                      required
                      className={errors.mobilePhone ? styles.errorInput : ''}
                    />
                    {errors.mobilePhone && (
                      <div className={styles.validationError}>{errors.mobilePhone}</div>
                    )}
                  </div>
                </div>

                {/* CNPJ Fields */}
                {formData.businessDocument && isCNPJ(formData.businessDocument) && (
                  <div className={styles.formGroup}>
                    <label>Tipo de Empresa <span className={styles.required}>*</span></label>
                    <select
                      name="companyType"
                      value={formData.companyType || ''}
                      onChange={(e) => {
                        const value = e.target.value as 'MEI' | 'LIMITED' | 'INDIVIDUAL' | 'ASSOCIATION' | '';
                        setFormData(prev => ({
                          ...prev,
                          companyType: value || undefined
                        }));
                      }}
                      required
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="MEI">MEI - Microempreendedor Individual</option>
                      <option value="LIMITED">Limitada</option>
                      <option value="INDIVIDUAL">Individual</option>
                      <option value="ASSOCIATION">Associação</option>
                    </select>
                  </div>
                )}
              </div>
            )}

             {/* Serviços da Casa - Movido para Step 1 */}
            <div className={styles.businessInfoSection}>
              <h4>⚙️ Configurações</h4>
              <p className={styles.sectionDescription}>
                Escolha quais serviços sua casa oferecerá. Isso determinará quais informações adicionais serão necessárias.
              </p>
              
              <div className={styles.servicesSection}>
                <div className={styles.serviceOption}>
                  <label className={styles.serviceCheckbox}>
                    <input
                      type="checkbox"
                      checked={formData.allowBookings}
                      onChange={(e) => handleBusinessServiceToggle('allowBookings', e.target.checked)}
                    />
                    <span className={styles.serviceInfo}>
                      <strong>Habilitar Atendimentos</strong>
                      <small>Permita agendamentos de consultas e atendimentos espirituais</small>
                    </span>
                  </label>
                </div>

                <div className={styles.serviceOption}>
                  <label className={styles.serviceCheckbox}>
                    <input
                      type="checkbox"
                      checked={formData.allowShop}
                      onChange={(e) => handleBusinessServiceToggle('allowShop', e.target.checked)}
                    />
                    <span className={styles.serviceInfo}>
                      <strong>Habilitar Lojinha</strong>
                      <small>Venda produtos espirituais, livros, amuletos e outros itens</small>
                    </span>
                  </label>
                </div>

                <div className={styles.serviceOption}>
                  <label className={styles.serviceCheckbox}>
                    <input
                      type="checkbox"
                      checked={formData.allowEvents}
                      onChange={(e) => handleBusinessServiceToggle('allowEvents', e.target.checked)}
                    />
                    <span className={styles.serviceInfo}>
                      <strong>Habilitar Eventos Premium</strong>
                      <small>Ofereça eventos especiais com cobrança de ingressos</small>
                    </span>
                  </label>
                </div>
              </div>
            </div>

          </div>
        );

      case 2:
        return (
          <div className={styles.stepContent}>
            <h3>Informações do Dirigente</h3>
            <p>Dados completos sobre o líder da sua casa espiritual</p>
            
            {/* Foto do Dirigente */}
            <div className={styles.formGroup}>
              <label>Foto do Dirigente <span className={styles.required}>*</span></label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLeaderPhotoChange}
                className={styles.fileInput}
                required={!leaderPhotoFile}
              />
              {leaderPhotoFile && (
                <div style={{ marginTop: '10px' }}>
                  <img 
                    src={URL.createObjectURL(leaderPhotoFile)} 
                    alt="Dirigente" 
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      borderRadius: '50%', 
                      objectFit: 'cover',
                      border: '2px solid #e1e5e9'
                    }} 
                  />
                </div>
              )}
              {errors['leader.photo'] && (
                <div className={styles.validationError}>{errors['leader.photo']}</div>
              )}
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Nome do Dirigente <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  name="leader.name"
                  value={formData.leader.name}
                  onChange={handleInputChange}
                  placeholder="Nome completo do dirigente"
                  required
                  className={errors['leader.name'] ? styles.errorInput : ''}
                />
                {errors['leader.name'] && (
                  <div className={styles.validationError}>{errors['leader.name']}</div>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label>Email do Dirigente <span className={styles.required}>*</span></label>
                <input
                  type="email"
                  name="leader.contact"
                  value={formData.leader.contact}
                  onChange={handleInputChange}
                  placeholder="email@dirigente.com"
                  required
                  className={errors['leader.contact'] ? styles.errorInput : ''}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>CPF do Dirigente <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  name="leader.cpf"
                  value={formData.leader.cpf}
                  onChange={(e) => {
                    const maskedValue = formatCPF(e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      leader: { ...prev.leader, cpf: maskedValue }
                    }));
                  }}
                  placeholder="000.000.000-00"
                  required
                  className={errors['leader.cpf'] ? styles.errorInput : ''}
                />
                {errors['leader.cpf'] && (
                  <div className={styles.validationError}>{errors['leader.cpf']}</div>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label>Data de Nascimento <span className={styles.required}>*</span></label>
                <input
                  type="date"
                  name="leader.birthDate"
                  value={formData.leader.birthDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Telefone Celular do Dirigente <span className={styles.required}>*</span></label>
              <input
                type="tel"
                name="leader.mobilePhone"
                value={formData.leader.mobilePhone}
                onChange={(e) => {
                  const maskedValue = formatPhone(e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    leader: { ...prev.leader, mobilePhone: maskedValue }
                  }));
                }}
                placeholder="(85) 99999-9999"
                required
                className={errors['leader.mobilePhone'] ? styles.errorInput : ''}
              />
              {errors['leader.mobilePhone'] && (
                <div className={styles.validationError}>{errors['leader.mobilePhone']}</div>
              )}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>CEP <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  name="leader.postalCode"
                  value={formData.leader.postalCode}
                  onChange={(e) => {
                    const maskedValue = formatCEP(e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      leader: { ...prev.leader, postalCode: maskedValue }
                    }));
                    if (validateCEP(maskedValue)) {
                      handleCEPChange(maskedValue, 'leader');
                    }
                  }}
                  placeholder="00000-000"
                  required
                  className={errors['leader.postalCode'] ? styles.errorInput : ''}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Bairro <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  name="leader.province"
                  value={formData.leader.province}
                  onChange={handleInputChange}
                  placeholder="Nome do bairro"
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Rua <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  name="leader.address"
                  value={formData.leader.address}
                  onChange={handleInputChange}
                  placeholder="Nome da rua"
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Número <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  name="leader.addressNumber"
                  value={formData.leader.addressNumber}
                  onChange={handleInputChange}
                  placeholder="123"
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Complemento</label>
              <input
                type="text"
                name="leader.complement"
                value={formData.leader.complement || ''}
                onChange={handleInputChange}
                placeholder="Apartamento, sala, andar..."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className={styles.stepContent}>
            <h3>Endereço da Casa</h3>
            <p>Localização da sua casa espiritual</p>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>CEP <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  name="location.postalCode"
                  value={formData.location.postalCode}
                  onChange={(e) => {
                    const maskedValue = formatCEP(e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, postalCode: maskedValue }
                    }));
                    if (validateCEP(maskedValue)) {
                      handleCEPChange(maskedValue, 'location');
                    }
                  }}
                  placeholder="00000-000"
                  required
                  className={errors['location.postalCode'] ? styles.errorInput : ''}
                />
                {errors['location.postalCode'] && (
                  <div className={styles.validationError}>{errors['location.postalCode']}</div>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label>Estado <span className={styles.required}>*</span></label>
                <select
                  value={formData.location.state}
                  onChange={handleInputChange}
                  name="location.state"
                  required
                  className={errors['location.state'] ? styles.errorInput : ''}
                >
                  <option value="">Selecione um estado</option>
                  {brazilianStates.map(state => (
                    <option key={state.abbr} value={state.abbr}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Cidade <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleInputChange}
                  placeholder="Nome da cidade"
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Bairro <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  name="location.neighborhood"
                  value={formData.location.neighborhood}
                  onChange={handleInputChange}
                  placeholder="Nome do bairro"
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Rua <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleInputChange}
                  placeholder="Nome da rua"
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Número <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  name="location.addressNumber"
                  value={formData.location.addressNumber}
                  onChange={handleInputChange}
                  placeholder="123"
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Complemento</label>
              <input
                type="text"
                name="location.complement"
                value={formData.location.complement || ''}
                onChange={handleInputChange}
                placeholder="Apartamento, sala, andar..."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Handle CEP change and auto-fill address
  const handleCEPChange = async (cep: string, target: 'location' | 'leader') => {
    try {
      const addressData = await fetchAddressByCEP(cep);
      if (addressData) {
        if (target === 'location') {
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              address: addressData.address,
              neighborhood: addressData.neighborhood,
              city: addressData.city,
              state: addressData.state
            }
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            leader: {
              ...prev.leader,
              address: addressData.address,
              province: addressData.neighborhood
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  return (
    <div className={styles.houseFormContainer}>
      <div className={styles.formHeader}>
        <h2>{isEdit ? 'Editar Casa' : 'Criar Nova Casa'}</h2>
        
        {/* Steps Indicator */}
        <div className={styles.stepsIndicator}>
          <div className={styles.stepsProgress}>
            <div 
              className={styles.progressBar} 
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
          <div className={styles.stepsList}>
            {steps.map((step) => (
              <div 
                key={step.id} 
                className={`${styles.step} ${currentStep === step.id ? styles.active : ''} ${currentStep > step.id ? styles.completed : ''}`}
              >
                <div className={styles.stepIcon}>{step.icon}</div>
                <div className={styles.stepTitle}>{step.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.houseForm}>
        {renderStepContent()}
        
        <div className={styles.formFooter}>
          <div className={styles.footerLeft}>
            {currentStep > 1 && (
              <button type="button" onClick={prevStep} className={styles.btnSecondary}>
                ← Anterior
              </button>
            )}
          </div>
          
          <div className={styles.footerRight}>
            {currentStep < steps.length ? (
              <button type="button" onClick={nextStep} className={styles.btnPrimary}>
                Próximo →
              </button>
            ) : (
              <button type="submit" disabled={loading || uploading} className={styles.btnSuccess}>
                {loading || uploading ? 'Salvando...' : (isEdit ? 'Atualizar Casa' : 'Criar Casa')}
              </button>
            )}
            
            <button type="button" onClick={onCancel} className={styles.btnCancel}>
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default HouseForm;