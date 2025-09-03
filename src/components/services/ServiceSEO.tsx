'use client';

import { Service } from '../../services/servicesService';

interface ServiceSEOProps {
  service: Service;
  houseName?: string;
}

export const ServiceSEO: React.FC<ServiceSEOProps> = ({ service, houseName }) => {
  const title = `${service.title} - ${houseName || 'Casa Espiritual'}`;
  const description = service.shortDescription || service.description.substring(0, 160);
  const image = service.images?.[0] || '/default-service-image.jpg';

  // Use a static URL for SSR to prevent hydration mismatches
  const baseUrl = 'https://rezo.app';
  const url = `${baseUrl}/services/${service.id}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.title,
    "description": description,
    "image": image,
    "provider": {
      "@type": "Organization",
      "name": houseName || "Casa Espiritual"
    },
    "offers": {
      "@type": "Offer",
      "price": service.basePrice,
      "priceCurrency": "BRL",
      "availability": "https://schema.org/InStock"
    },
    "category": service.category,
    "url": url
  };

  return (
    <>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={`${service.category}, ${service.tags?.join(', ')}, serviços espirituais, ${houseName}`} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:price:amount" content={service.basePrice.toString()} />
      <meta property="og:price:currency" content="BRL" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* WhatsApp specific */}
      <meta property="og:site_name" content="Rezo - Plataforma Espiritual" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Additional structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
    </>
  );
};

export default ServiceSEO;