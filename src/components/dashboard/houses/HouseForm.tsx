import React, { useState, useEffect } from 'react';
import { House, CreateHouseData, UpdateHouseData } from '../../../services/housesService';
import { 
  createHouse, 
  updateHouse, 
  getHouseById, 
  uploadHouseImage, 
  deleteHouseImage,
  getAvailableCults,
  getBrazilianStates
} from '../../../services/housesService';

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

  const [formData, setFormData] = useState<CreateHouseData>({
    name: '',
    leader: {
      name: '',
      photo: '',
      bio: '',
      contact: ''
    },
    phone: '',
    whatsapp: '',
    accessibility: '',
    street: '',
    neighborhood: '',
    number: '',
    complement: '',
    zipCode: '',
    city: '',
    state: '',
    location: { lat: 0, lng: 0 },
    about: '',
    socialMedia: {
      facebook: '',
      instagram: ''
    },
    cult: '',
    responsibles: [],
    notificationTemplate: '',
    enabledShop: false,
    logo: '',
    gallery: []
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [leaderPhotoFile, setLeaderPhotoFile] = useState<File | null>(null);

  const cults = getAvailableCults();
  const states = getBrazilianStates();

  useEffect(() => {
    if (isEdit && houseId) {
      loadHouse();
    }
  }, [isEdit, houseId]);

  const loadHouse = async () => {
    if (!houseId) return;
    
    try {
      setLoading(true);
      setError('');
      const house = await getHouseById(houseId);
      if (house) {
        setFormData({
          name: house.name,
          leader: house.leader,
          phone: house.phone,
          whatsapp: house.whatsapp || '',
          accessibility: house.accessibility || '',
          street: house.street,
          neighborhood: house.neighborhood,
          number: house.number,
          complement: house.complement || '',
          zipCode: house.zipCode,
          city: house.city,
          state: house.state,
          location: house.location,
          about: house.about,
          socialMedia: house.socialMedia || { facebook: '', instagram: '' },
          cult: house.cult,
          responsibles: house.responsibles,
          notificationTemplate: house.notificationTemplate || '',
          enabledShop: house.enabledShop,
          logo: house.logo || '',
          gallery: house.gallery || []
        });
      } else {
        setError('Casa não encontrada');
      }
    } catch (error) {
      console.error('Error loading house:', error);
      setError('Erro ao carregar casa');
    } finally {
      setLoading(false);
    }
  };

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
        } else if (parent === 'socialMedia') {
          return {
            ...prev,
            socialMedia: {
              ...prev.socialMedia,
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
      case 'gallery':
        if (files.length + (formData.gallery?.length || 0) > 5) {
          setError('Máximo 5 imagens na galeria');
          return;
        }
        setGalleryFiles(Array.from(files));
        break;
      case 'leaderPhoto':
        setLeaderPhotoFile(files[0]);
        break;
    }
  };

  const uploadFiles = async (houseId: string): Promise<CreateHouseData> => {
    let updatedFormData = { ...formData };

    // Upload logo
    if (logoFile) {
      const logoUrl = await uploadHouseImage(logoFile, houseId, 'logo');
      updatedFormData.logo = logoUrl;
    }

    // Upload leader photo
    if (leaderPhotoFile) {
      const photoUrl = await uploadHouseImage(leaderPhotoFile, houseId, 'gallery');
      updatedFormData.leader = { ...updatedFormData.leader, photo: photoUrl };
    }

    // Upload gallery images
    if (galleryFiles.length > 0) {
      const galleryUrls = await Promise.all(
        galleryFiles.map(file => uploadHouseImage(file, houseId, 'gallery'))
      );
      updatedFormData.gallery = [...(updatedFormData.gallery || []), ...galleryUrls];
    }

    return updatedFormData;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      setLoading(true);
      setUploading(true);

      if (isEdit && houseId) {
        // Upload new files if any
        let finalFormData = formData;
        if (logoFile || leaderPhotoFile || galleryFiles.length > 0) {
          finalFormData = await uploadFiles(houseId);
        }

        const updateData: UpdateHouseData = finalFormData;
        await updateHouse(houseId, updateData);
        
        if (onSuccess) {
          onSuccess(houseId);
        }
      } else {
        // Create new house
        const newHouseId = await createHouse(formData);
        
        // Upload files after creating house
        if (logoFile || leaderPhotoFile || galleryFiles.length > 0) {
          const finalFormData = await uploadFiles(newHouseId);
          // Update house with uploaded file URLs
          await updateHouse(newHouseId, finalFormData);
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

  const removeGalleryImage = async (imageUrl: string, index: number) => {
    try {
      if (isEdit) {
        await deleteHouseImage(imageUrl);
      }
      setFormData(prev => ({
        ...prev,
        gallery: prev.gallery?.filter((_, i) => i !== index) || []
      }));
    } catch (error) {
      console.error('Error removing image:', error);
      setError('Erro ao remover imagem');
    }
  };

  if (loading && isEdit) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card shadow-sm my-4">
        <div className="card-body">
          <h1 className="h3 fw-bold mb-4">
            {isEdit ? 'Editar Casa' : 'Nova Casa'}
          </h1>
          {error && (
            <div className="alert alert-danger">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="row g-4">
            {/* Basic Information */}
            <div className="col-md-6">
              <label className="form-label">Nome da Casa *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="form-control"
                placeholder="Ex: Cruzeiro Encantado"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Culto *</label>
              <select
                name="cult"
                value={formData.cult}
                onChange={handleInputChange}
                required
                className="form-select"
              >
                <option value="">Selecione um culto</option>
                {cults.map(cult => (
                  <option key={cult} value={cult}>{cult}</option>
                ))}
              </select>
            </div>
            {/* Logo Upload */}
            <div className="col-md-6">
              <label className="form-label">Logo da Casa</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'logo')}
                className="form-control"
              />
              {formData.logo && (
                <div className="mt-2">
                  <img src={formData.logo} alt="Logo" className="img-thumbnail" style={{ width: 80, height: 80, objectFit: 'cover' }} />
                </div>
              )}
            </div>
            {/* Leader Information */}
            <div className="col-12">
              <h2 className="h5 fw-bold mt-4">Informações do Dirigente</h2>
            </div>
            <div className="col-md-4">
              <label className="form-label">Nome do Dirigente *</label>
              <input
                type="text"
                name="leader.name"
                value={formData.leader.name}
                onChange={handleInputChange}
                required
                className="form-control"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Email do Dirigente *</label>
              <input
                type="email"
                name="leader.contact"
                value={formData.leader.contact}
                onChange={handleInputChange}
                required
                className="form-control"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Foto do Dirigente</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'leaderPhoto')}
                className="form-control"
              />
              {formData.leader.photo && (
                <div className="mt-2">
                  <img src={formData.leader.photo} alt="Dirigente" className="img-thumbnail rounded-circle" style={{ width: 80, height: 80, objectFit: 'cover' }} />
                </div>
              )}
            </div>
            <div className="col-12">
              <label className="form-label">Biografia do Dirigente (máx. 500 caracteres)</label>
              <textarea
                name="leader.bio"
                value={formData.leader.bio}
                onChange={handleInputChange}
                maxLength={500}
                rows={3}
                className="form-control"
                placeholder="Breve biografia do dirigente"
              />
              <small className="text-muted">{formData.leader.bio.length}/500 caracteres</small>
            </div>
            {/* Contact Information */}
            <div className="col-12">
              <h2 className="h5 fw-bold mt-4">Contato</h2>
            </div>
            <div className="col-md-6">
              <label className="form-label">Telefone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="form-control"
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">WhatsApp</label>
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                className="form-control"
                placeholder="(11) 99999-9999"
              />
            </div>
            {/* Address */}
            <div className="col-12">
              <h2 className="h5 fw-bold mt-4">Endereço</h2>
            </div>
            <div className="col-md-4">
              <label className="form-label">Rua *</label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                required
                className="form-control"
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Número *</label>
              <input
                type="text"
                name="number"
                value={formData.number}
                onChange={handleInputChange}
                required
                className="form-control"
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Bairro *</label>
              <input
                type="text"
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleInputChange}
                required
                className="form-control"
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Complemento</label>
              <input
                type="text"
                name="complement"
                value={formData.complement}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">CEP *</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                required
                className="form-control"
                placeholder="00000-000"
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Cidade *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="form-control"
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Estado *</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
                className="form-select"
              >
                <option value="">Selecione um estado</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            {/* About */}
            <div className="col-12">
              <label className="form-label">Sobre a Casa (máx. 1000 caracteres) *</label>
              <textarea
                name="about"
                value={formData.about}
                onChange={handleInputChange}
                maxLength={1000}
                rows={4}
                required
                className="form-control"
                placeholder="Descreva a casa, suas práticas, história..."
              />
              <small className="text-muted">{formData.about.length}/1000 caracteres</small>
            </div>
            {/* Social Media */}
            <div className="col-12">
              <h2 className="h5 fw-bold mt-4">Redes Sociais</h2>
            </div>
            <div className="col-md-6">
              <label className="form-label">Facebook</label>
              <input
                type="url"
                name="socialMedia.facebook"
                value={formData.socialMedia?.facebook || ''}
                onChange={handleInputChange}
                className="form-control"
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Instagram</label>
              <input
                type="url"
                name="socialMedia.instagram"
                value={formData.socialMedia?.instagram || ''}
                onChange={handleInputChange}
                className="form-control"
                placeholder="https://instagram.com/..."
              />
            </div>
            {/* Gallery */}
            <div className="col-12">
              <h2 className="h5 fw-bold mt-4">Galeria (máx. 5 imagens)</h2>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileChange(e, 'gallery')}
                className="form-control"
              />
              {formData.gallery && formData.gallery.length > 0 && (
                <div className="row mt-2">
                  {formData.gallery.map((imageUrl, index) => (
                    <div key={index} className="col-4 col-md-2 position-relative">
                      <img
                        src={imageUrl}
                        alt={`Galeria ${index + 1}`}
                        className="img-thumbnail"
                        style={{ height: 80, objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(imageUrl, index)}
                        className="btn btn-sm btn-danger position-absolute top-0 end-0"
                        style={{ zIndex: 2 }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Additional Options */}
            <div className="col-12">
              <h2 className="h5 fw-bold mt-4">Opções Adicionais</h2>
            </div>
            <div className="col-md-6">
              <label className="form-label">Acessibilidade</label>
              <textarea
                name="accessibility"
                value={formData.accessibility}
                onChange={handleInputChange}
                rows={2}
                className="form-control"
                placeholder="Informações sobre acessibilidade do local"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Template de Notificação</label>
              <textarea
                name="notificationTemplate"
                value={formData.notificationTemplate}
                onChange={handleInputChange}
                rows={2}
                className="form-control"
                placeholder="Template personalizado para notificações"
              />
            </div>
            <div className="col-12 mt-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  name="enabledShop"
                  checked={formData.enabledShop}
                  onChange={handleInputChange}
                  className="form-check-input"
                  id="enabledShopCheck"
                />
                <label className="form-check-label" htmlFor="enabledShopCheck">
                  Habilitar Lojinha
                </label>
              </div>
            </div>
            {/* Submit Buttons */}
            <div className="col-12 d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-outline-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="btn btn-primary"
              >
                {loading || uploading ? (uploading ? 'Fazendo upload...' : 'Salvando...') : (isEdit ? 'Atualizar' : 'Criar Casa')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HouseForm;