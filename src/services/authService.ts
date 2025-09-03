import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  User
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { rezosDb as db, auth } from '../app/lib/firebase';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: any;
  updatedAt: any;
  role: 'user' | 'admin';
  isActive: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Register a new user
 */
export const registerUser = async (userData: RegisterData): Promise<UserProfile> => {
  try {
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userData.email, 
      userData.password
    );
    
    const user = userCredential.user;

    // Create user profile in rezos database
    const userProfile: Omit<UserProfile, 'id'> = {
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      role: 'user',
      isActive: true
    };

    // Save to rezos database
    await setDoc(doc(db, 'users', user.uid), userProfile);

    return {
      id: user.uid,
      ...userProfile,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error: any) {
    console.error('Error registering user:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Login user
 */
export const loginUser = async (loginData: LoginData): Promise<UserProfile> => {
  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(
      auth,
      loginData.email,
      loginData.password
    );

    const user = userCredential.user;

    // Get user profile from rezos database
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      throw new Error('Perfil do usuário não encontrado');
    }

    const userData = userDoc.data() as Omit<UserProfile, 'id'>;

    // Check if user is active
    if (!userData.isActive) {
      await signOut(auth);
      throw new Error('Conta desativada. Entre em contato com o suporte.');
    }

    // Update last login
    await updateDoc(doc(db, 'users', user.uid), {
      lastLogin: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return {
      id: user.uid,
      ...userData
    };
  } catch (error: any) {
    console.error('Error logging in:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Error sending password reset:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Logout user
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Error logging out:', error);
    throw new Error('Erro ao fazer logout');
  }
};

/**
 * Get current user profile
 */
export const getCurrentUserProfile = async (user: User): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data() as Omit<UserProfile, 'id'>;
    
    return {
      id: user.uid,
      ...userData
    };
  } catch (error: any) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    throw new Error('Erro ao atualizar perfil');
  }
};

/**
 * Convert Firebase Auth error codes to user-friendly messages
 */
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Este email já está sendo usado por outra conta';
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres';
    case 'auth/invalid-email':
      return 'Email inválido';
    case 'auth/user-not-found':
      return 'Usuário não encontrado';
    case 'auth/wrong-password':
      return 'Senha incorreta';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde';
    case 'auth/network-request-failed':
      return 'Erro de conexão. Verifique sua internet';
    case 'auth/user-disabled':
      return 'Esta conta foi desativada';
    default:
      return 'Erro de autenticação. Tente novamente';
  }
};