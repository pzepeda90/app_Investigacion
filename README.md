# Aplicación de Búsqueda de Evidencia Científica

Esta aplicación permite buscar evidencia científica médica mediante la traducción de términos comunes a términos MeSH (Medical Subject Headings), enfocándose inicialmente en el campo de la oftalmología.

## Características

- Traducción automática de términos médicos comunes a términos MeSH
- Búsqueda en PubMed utilizando términos MeSH para resultados más precisos
- Interfaz amigable con visualización clara de las traducciones MeSH
- Resultados de búsqueda organizados y paginados

## Configuración

### Requisitos previos

- Node.js (v14 o superior)
- NPM o Yarn
- API Key de PubMed/NCBI E-utilities

### Instalación

1. Clona este repositorio:
```bash
git clone https://github.com/tu-usuario/mi-app-evidencia-cientifica.git
cd mi-app-evidencia-cientifica
```

2. Instala las dependencias del backend:
```bash
cd backend
npm install
```

3. Instala las dependencias del frontend:
```bash
cd ../frontend
npm install
```

### Configuración de la API Key de PubMed

1. Obtén una API Key de NCBI E-utilities:
   - Visita [NCBI](https://www.ncbi.nlm.nih.gov/account/register/)
   - Regístrate y solicita una API Key

2. Configura las variables de entorno:
   - Copia el archivo `.env.example` a `.env` en la carpeta `backend`
   - Actualiza las variables con tu API Key y correo electrónico:
   ```
   PUBMED_API_KEY=tu_api_key_aqui
   CONTACT_EMAIL=tucorreo@ejemplo.com
   ```

## Ejecución

### Desarrollo

1. Inicia el backend:
```bash
cd backend
npm run dev
```

2. En otra terminal, inicia el frontend:
```bash
cd frontend
npm run dev
```

3. Abre tu navegador en `http://localhost:5173` (o el puerto que te indique el terminal)

## Uso

1. Escribe términos médicos oftalmológicos en el buscador
2. El sistema traducirá automáticamente esos términos a MeSH
3. Los resultados de PubMed se mostrarán ordenados por relevancia
4. Puedes expandir la información de cada resultado para ver más detalles

## Términos MeSH cubiertos

Actualmente, la aplicación cubre términos MeSH relacionados con:
- Enfermedades oftalmológicas comunes (glaucoma, cataratas, etc.)
- Anatomía ocular (retina, córnea, etc.)
- Procedimientos y tratamientos oftalmológicos
- Síntomas relacionados con problemas visuales

## Expansión futura

Para expandir los términos MeSH cubiertos, edita el archivo `backend/src/utils/meshMapper.js` añadiendo nuevos términos a la estructura de datos existente.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue para discutir los cambios que te gustaría hacer. # app_Investigacion
