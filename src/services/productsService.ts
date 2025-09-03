import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { rezosDb as db, storage, auth } from '../app/lib/firebase';

// TypeScript interfaces for Products
export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku?: string;
  attributes?: { [key: string]: string }; // color, size, etc.
}

export interface Product {
  id?: string;
  name: string;
  description: string;
  shortDescription?: string;
  houseId: string; // Reference to the house selling the product
  sellerId: string; // User who created the product
  category: string;
  subcategory?: string;
  price: number;
  comparePrice?: number; // Original price for discounts
  variants?: ProductVariant[];
  images: string[];
  tags?: string[];
  stock: number;
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  shipping: {
    freeShipping: boolean;
    shippingCost?: number;
    shippingTime?: string;
  };
  isActive: boolean;
  isDigital: boolean;
  isFeatured: boolean;
  allowReviews: boolean;
  metaTitle?: string;
  metaDescription?: string;
  seoSlug?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  deleted: boolean;
}

export interface CreateProductData extends Omit<Product, 'id' | 'sellerId' | 'isActive' | 'createdAt' | 'updatedAt' | 'deleted'> {}

export interface UpdateProductData extends Partial<Omit<Product, 'id' | 'sellerId' | 'createdAt'>> {}

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  houseId?: string;
  sellerId?: string;
  priceMin?: number;
  priceMax?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isDigital?: boolean;
  deleted?: boolean;
  tags?: string[];
}

export interface ProductPaginationOptions {
  limitCount?: number;
  lastDoc?: QueryDocumentSnapshot<DocumentData>;
}

const PRODUCTS_COLLECTION = 'products';

// Create a new product
export const createProduct = async (productData: CreateProductData): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to create a product');
    }

    // Clean data to remove undefined values
    const cleanProductData: any = {
      name: productData.name,
      description: productData.description,
      houseId: productData.houseId,
      sellerId: user.uid,
      category: productData.category,
      price: productData.price,
      stock: productData.stock,
      images: productData.images || [],
      isActive: true,
      isDigital: productData.isDigital || false,
      isFeatured: productData.isFeatured || false,
      allowReviews: productData.allowReviews !== false,
      deleted: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      shipping: {
        freeShipping: productData.shipping?.freeShipping || false,
        shippingCost: productData.shipping?.shippingCost,
        shippingTime: productData.shipping?.shippingTime
      }
    };

    // Add optional fields only if they have values
    if (productData.shortDescription) {
      cleanProductData.shortDescription = productData.shortDescription;
    }

    if (productData.subcategory) {
      cleanProductData.subcategory = productData.subcategory;
    }

    if (productData.comparePrice) {
      cleanProductData.comparePrice = productData.comparePrice;
    }

    if (productData.variants && productData.variants.length > 0) {
      cleanProductData.variants = productData.variants;
    }

    if (productData.tags && productData.tags.length > 0) {
      cleanProductData.tags = productData.tags;
    }

    if (productData.sku) {
      cleanProductData.sku = productData.sku;
    }

    if (productData.weight) {
      cleanProductData.weight = productData.weight;
    }

    if (productData.dimensions) {
      cleanProductData.dimensions = productData.dimensions;
    }

    if (productData.metaTitle) {
      cleanProductData.metaTitle = productData.metaTitle;
    }

    if (productData.metaDescription) {
      cleanProductData.metaDescription = productData.metaDescription;
    }

    if (productData.seoSlug) {
      cleanProductData.seoSlug = productData.seoSlug;
    }

    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), cleanProductData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Get a product by ID
export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Product;
    }
    return null;
  } catch (error) {
    console.error('Error getting product:', error);
    throw error;
  }
};

// Update a product
export const updateProduct = async (productId: string, updateData: UpdateProductData): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to update a product');
    }

    // Get current product to check permissions
    const currentProduct = await getProductById(productId);
    if (!currentProduct) {
      throw new Error('Product not found');
    }

    // Check if user is seller or house owner
    if (currentProduct.sellerId !== user.uid) {
      // TODO: Also check if user is house owner/responsible
      throw new Error('User not authorized to update this product');
    }

    // Clean update data to remove undefined values
    const cleanUpdateData: any = {
      updatedAt: Timestamp.now()
    };

    // Add only defined values
    Object.keys(updateData).forEach(key => {
      const value = (updateData as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        cleanUpdateData[key] = value;
      }
    });

    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(docRef, cleanUpdateData);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Soft delete a product
export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to delete a product');
    }

    const currentProduct = await getProductById(productId);
    if (!currentProduct) {
      throw new Error('Product not found');
    }

    if (currentProduct.sellerId !== user.uid) {
      throw new Error('Only the seller can delete a product');
    }

    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(docRef, {
      deleted: true,
      isActive: false,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Get products with filters and pagination
export const getProducts = async (
  filters: ProductFilters = {},
  pagination: ProductPaginationOptions = {}
): Promise<{ products: Product[]; lastDoc?: QueryDocumentSnapshot<DocumentData> }> => {
  try {
    const { 
      category, 
      subcategory, 
      houseId,
      sellerId,
      priceMin,
      priceMax,
      isActive = true,
      isFeatured,
      isDigital,
      deleted = false,
      tags
    } = filters;
    
    const { limitCount = 20, lastDoc } = pagination;

    let q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('deleted', '==', deleted)
    );

    // Add filters
    if (isActive !== undefined) {
      q = query(q, where('isActive', '==', isActive));
    }

    if (category && category.trim()) {
      q = query(q, where('category', '==', category.trim()));
    }

    if (subcategory && subcategory.trim()) {
      q = query(q, where('subcategory', '==', subcategory.trim()));
    }

    if (houseId && houseId.trim()) {
      q = query(q, where('houseId', '==', houseId.trim()));
    }

    if (sellerId && sellerId.trim()) {
      q = query(q, where('sellerId', '==', sellerId.trim()));
    }

    if (isFeatured !== undefined) {
      q = query(q, where('isFeatured', '==', isFeatured));
    }

    if (isDigital !== undefined) {
      q = query(q, where('isDigital', '==', isDigital));
    }

    // Order by creation date (newest first)
    q = query(q, orderBy('createdAt', 'desc'), limit(limitCount));

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    
    let products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];

    // Apply client-side filters for complex queries
    if (priceMin !== undefined) {
      products = products.filter(product => product.price >= priceMin);
    }

    if (priceMax !== undefined) {
      products = products.filter(product => product.price <= priceMax);
    }

    if (tags && tags.length > 0) {
      products = products.filter(product => 
        product.tags && tags.some(tag => product.tags!.includes(tag))
      );
    }

    const lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1];

    return {
      products,
      lastDoc: lastDocument
    };
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
};

// Get products by house
export const getProductsByHouse = async (houseId: string): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('houseId', '==', houseId),
      where('deleted', '==', false),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  } catch (error) {
    console.error('Error getting products by house:', error);
    throw error;
  }
};

// Get products by seller
export const getProductsBySeller = async (sellerId?: string): Promise<Product[]> => {
  try {
    const userId = sellerId || auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User ID required');
    }

    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('sellerId', '==', userId),
      where('deleted', '==', false),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  } catch (error) {
    console.error('Error getting products by seller:', error);
    throw error;
  }
};

// Upload product image
export const uploadProductImage = async (
  file: File, 
  productId: string
): Promise<string> => {
  try {
    const timestamp = Date.now();
    const fileName = `product_${timestamp}_${file.name}`;
    const storageRef = ref(storage, `products/${productId}/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading product image:', error);
    throw error;
  }
};

// Delete product image
export const deleteProductImage = async (imageUrl: string): Promise<void> => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting product image:', error);
    throw error;
  }
};

// Get available product categories
export const getProductCategories = (): string[] => {
  return [
    'Artesanato',
    'Livros',
    'Incensos',
    'Velas',
    'Cristais',
    'Óleos Essenciais',
    'Ervas',
    'Decoração',
    'Roupas',
    'Acessórios',
    'Instrumentos Musicais',
    'Produtos Digitais',
    'Cursos',
    'Consultorias',
    'Outro'
  ];
};

// Toggle product featured status
export const toggleProductFeatured = async (productId: string): Promise<void> => {
  try {
    const product = await getProductById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    await updateProduct(productId, {
      isFeatured: !product.isFeatured
    });
  } catch (error) {
    console.error('Error toggling product featured status:', error);
    throw error;
  }
};

// Toggle product active status
export const toggleProductActive = async (productId: string): Promise<void> => {
  try {
    const product = await getProductById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    await updateProduct(productId, {
      isActive: !product.isActive
    });
  } catch (error) {
    console.error('Error toggling product active status:', error);
    throw error;
  }
};