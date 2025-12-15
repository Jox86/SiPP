// Tratamiento de Errores
export const handleAsync = fn => fn().catch(console.error);