/* Verificación de Instalación*/

export const checkDependencies = () => {
  const dependencies = {
    langchain: typeof window !== 'undefined' ? 'N/A' : typeof require !== 'undefined' ? 'OK' : 'Missing',
    tfjs: typeof tf !== 'undefined' ? 'OK' : 'Missing',
    natural: typeof natural !== 'undefined' ? 'OK' : 'Missing',
    compromise: typeof nlp !== 'undefined' ? 'OK' : 'Missing'
  };

  console.log('Dependency Check:', dependencies);
  return dependencies;
};