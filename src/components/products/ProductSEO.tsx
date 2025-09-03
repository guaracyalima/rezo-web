'use client';

interface ProductSEOProps {
  product: {
    id?: string;
    name: string;
    price: number;
    shortDescription?: string;
    description: string;
    category: string;
    tags?: string[];
    images?: string[];
    stock: number;
    sku?: string;
  };
  houseName?: string;
}

export const ProductSEO: React.FC<ProductSEOProps> = ({ product, houseName }) => {
  const title = `${product.name} - ${houseName || 'Casa Espiritual'}`;
  const description = product.shortDescription || product.description.substring(0, 160);
  const image = product.images?.[0] || '/default-product-image.jpg';
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/products/${product.id}`;
  const price = `R$ ${product.price.toFixed(2)}`;

  return (
    <>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={`${product.category}, ${product.tags?.join(', ')}, produtos espirituais, ${houseName}`} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="product" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:price:amount" content={product.price.toString()} />
      <meta property="og:price:currency" content="BRL" />
      <meta property="product:availability" content={product.stock > 0 ? "in stock" : "out of stock"} />
      <meta property="product:condition" content="new" />
      
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
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": description,
            "image": image,
            "brand": {
              "@type": "Organization",
              "name": houseName || "Casa Espiritual"
            },
            "offers": {
              "@type": "Offer",
              "price": product.price,
              "priceCurrency": "BRL",
              "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "itemCondition": "https://schema.org/NewCondition"
            },
            "category": product.category,
            "url": url,
            "sku": product.sku || product.id
          })
        }}
      />
    </>
  );
};

export default ProductSEO;