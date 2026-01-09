/**
 * Safe error handler for database operations.
 * Maps technical error messages to user-friendly messages
 * to prevent information disclosure.
 */
export const handleDatabaseError = (error: any, context: string): string => {
  // Log full error for debugging (only visible server-side/console)
  console.error(`Database error in ${context}:`, error);
  
  // Return safe, generic messages to users based on error codes
  if (error?.code === '23505') {
    // Unique constraint violation
    return 'Este item já existe. Tente outro nome.';
  }
  
  if (error?.code === '23503') {
    // Foreign key violation
    return 'Não foi possível salvar devido a referências inválidas.';
  }
  
  if (error?.code === '23502') {
    // Not null violation
    return 'Preencha todos os campos obrigatórios.';
  }
  
  if (error?.message?.includes('row-level security')) {
    return 'Você não tem permissão para realizar esta ação.';
  }
  
  if (error?.message?.includes('JWT')) {
    return 'Sua sessão expirou. Faça login novamente.';
  }
  
  // Generic fallback - never expose raw error messages
  return 'Ocorreu um erro. Tente novamente ou contate o suporte.';
};

/**
 * Validates YouTube video ID format.
 * YouTube IDs are exactly 11 characters: alphanumeric, underscore, or hyphen.
 */
export const isValidYoutubeId = (id: string): boolean => {
  return /^[a-zA-Z0-9_-]{11}$/.test(id);
};

/**
 * Extracts and validates YouTube video ID from various URL formats.
 * Returns null if the URL is invalid or the ID doesn't match YouTube's format.
 */
export const extractYoutubeId = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;
  
  // Trim and clean the URL
  const cleanUrl = url.trim();
  
  // If it's already just an 11-character ID, validate and return
  if (isValidYoutubeId(cleanUrl)) {
    return cleanUrl;
  }
  
  // Extract potential ID with restricted character set
  const match = cleanUrl.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]+)/
  );
  
  if (!match) return null;
  
  const id = match[1];
  
  // Validate YouTube ID format: exactly 11 characters
  if (!isValidYoutubeId(id)) {
    return null;
  }
  
  return id;
};
