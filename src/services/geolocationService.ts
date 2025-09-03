export interface LocationData {
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

/**
 * Get user's current location using browser geolocation API
 */
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não suportada neste navegador'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => {
        let message = 'Erro ao obter localização';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Permissão de localização negada pelo usuário';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Localização indisponível no momento';
            break;
          case error.TIMEOUT:
            message = 'Timeout ao obter localização';
            break;
        }
        console.warn('Geolocation error:', { code: error.code, message: error.message });
        reject(new Error(message));
      },
      {
        enableHighAccuracy: false, // Changed to false for better compatibility
        timeout: 8000, // Reduced timeout
        maximumAge: 600000 // 10 minutes
      }
    );
  });
};

/**
 * Convert coordinates to city/state using reverse geocoding
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<LocationData> => {
  try {
    // Using a free geocoding service
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=pt`
    );
    
    if (!response.ok) {
      throw new Error('Erro ao obter informações de localização');
    }
    
    const data = await response.json();
    
    // Extract city and state from response
    let city = data.city || data.locality || data.countryName || '';
    let state = data.principalSubdivision || '';
    
    // Map state names to abbreviations for Brazil
    if (data.countryCode === 'BR' && state) {
      state = mapBrazilianStateToCode(state);
    }
    
    return {
      city: city,
      state: state,
      country: data.countryName || '',
      lat,
      lng
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw new Error('Erro ao obter informações da localização');
  }
};

/**
 * Get user's location with city and state
 */
export const getUserLocation = async (): Promise<LocationData> => {
  try {
    // First try GPS geolocation
    const position = await getCurrentLocation();
    const { latitude, longitude } = position.coords;
    
    const locationData = await reverseGeocode(latitude, longitude);
    return locationData;
  } catch (gpsError) {
    console.warn('GPS geolocation failed, trying IP-based location:', gpsError);
    
    try {
      // Fallback to IP-based geolocation
      const ipLocation = await getLocationByIP();
      return ipLocation;
    } catch (ipError) {
      console.warn('IP-based location failed:', ipError);
      
      // Final fallback - return empty location to show all houses
      return {
        city: '',
        state: '',
        country: 'Brasil',
        lat: -23.5505,
        lng: -46.6333
      };
    }
  }
};

/**
 * Get location based on IP address (fallback method)
 */
export const getLocationByIP = async (): Promise<LocationData> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    
    if (!response.ok) {
      throw new Error('Failed to get IP location');
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.reason || 'IP location service error');
    }
    
    let state = data.region_code || data.region || '';
    
    // Map Brazilian states if needed
    if (data.country_code === 'BR' && data.region) {
      state = mapBrazilianStateToCode(data.region);
    }
    
    return {
      city: data.city || '',
      state: state,
      country: data.country_name || '',
      lat: data.latitude || 0,
      lng: data.longitude || 0
    };
  } catch (error) {
    console.error('IP-based geolocation error:', error);
    throw error;
  }
};

/**
 * Map Brazilian state names to codes
 */
const mapBrazilianStateToCode = (stateName: string): string => {
  const stateMap: { [key: string]: string } = {
    'Acre': 'AC',
    'Alagoas': 'AL',
    'Amapá': 'AP',
    'Amazonas': 'AM',
    'Bahia': 'BA',
    'Ceará': 'CE',
    'Distrito Federal': 'DF',
    'Espírito Santo': 'ES',
    'Goiás': 'GO',
    'Maranhão': 'MA',
    'Mato Grosso': 'MT',
    'Mato Grosso do Sul': 'MS',
    'Minas Gerais': 'MG',
    'Pará': 'PA',
    'Paraíba': 'PB',
    'Paraná': 'PR',
    'Pernambuco': 'PE',
    'Piauí': 'PI',
    'Rio de Janeiro': 'RJ',
    'Rio Grande do Norte': 'RN',
    'Rio Grande do Sul': 'RS',
    'Rondônia': 'RO',
    'Roraima': 'RR',
    'Santa Catarina': 'SC',
    'São Paulo': 'SP',
    'Sergipe': 'SE',
    'Tocantins': 'TO'
  };
  
  return stateMap[stateName] || stateName;
};