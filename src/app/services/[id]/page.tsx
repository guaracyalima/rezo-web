import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServiceById } from '../../../services/servicesService';
import { getHouseById } from '../../../services/housesService';
import ServiceSEO from '../../../components/services/ServiceSEO';
import PublicServiceDetailClient from './PublicServiceDetailClient';

interface PageProps {
  params: Promise<{ id: string }>
}

// Helper function to serialize data for client components
function serializeService(service: any) {
  return {
    ...service,
    createdAt: service.createdAt?.toDate?.() ? service.createdAt.toDate().toISOString() : service.createdAt,
    updatedAt: service.updatedAt?.toDate?.() ? service.updatedAt.toDate().toISOString() : service.updatedAt,
  };
}

function serializeHouse(house: any) {
  if (!house) return null;
  return {
    ...house,
    createdAt: house.createdAt?.toDate?.() ? house.createdAt.toDate().toISOString() : house.createdAt,
    updatedAt: house.updatedAt?.toDate?.() ? house.updatedAt.toDate().toISOString() : house.updatedAt,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const service = await getServiceById(id);
    if (!service) {
      return {
        title: 'Serviço não encontrado - Rezo',
        description: 'O serviço solicitado não foi encontrado.'
      };
    }

    const house = service.houseId ? await getHouseById(service.houseId) : null;
    const title = `${service.title} - ${house?.name || 'Casa Espiritual'} | Rezo`;
    const description = service.shortDescription || service.description.substring(0, 160);
    const image = service.images?.[0] || '/default-service-image.jpg';

    return {
      title,
      description,
      keywords: `${service.category}, ${service.tags?.join(', ')}, serviços espirituais, ${house?.name}`,
      openGraph: {
        type: 'website',
        title,
        description,
        images: [{ url: image }],
        siteName: 'Rezo - Plataforma Espiritual',
        locale: 'pt_BR',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
      other: {
        'og:price:amount': service.basePrice.toString(),
        'og:price:currency': 'BRL',
      }
    };
  } catch (error) {
    return {
      title: 'Erro - Rezo',
      description: 'Erro ao carregar o serviço.'
    };
  }
}

export default async function PublicServiceDetailPage({ params }: PageProps) {
  try {
    const { id } = await params;
    const service = await getServiceById(id);
    
    if (!service || !service.isActive) {
      notFound();
    }

    const house = service.houseId ? await getHouseById(service.houseId) : null;

    // Serialize the data to avoid toJSON issues
    const serializedService = serializeService(service);
    const serializedHouse = serializeHouse(house);

    return (
      <>
        <ServiceSEO service={serializedService} houseName={serializedHouse?.name} />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {service.title}
        </h1>
        <p className="text-gray-600 mb-6">
          Atendimento oferecido por {house?.title || 'Casa Espiritual'}
        </p>
        <h2 className="text-xl font-semibold mb-4">
          Agendamento de Atendimento
        </h2>
        <p className="text-gray-600 mb-6">
          Selecione uma data e horário para seu atendimento
        </p>
        <PublicServiceDetailClient service={serializedService} house={serializedHouse} title="Agendar Atendimento" description="Reserve seu horário para atendimento" />
      </>
    );
  } catch (error) {
    notFound();
  }
}