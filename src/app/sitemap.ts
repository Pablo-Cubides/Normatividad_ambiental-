import { MetadataRoute } from 'next';
import path from 'path';
import fs from 'fs';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://tudominio.com';

// Dominios disponibles
const DOMINIOS = ['agua', 'calidad-aire', 'residuos-solidos', 'vertimientos'];

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemap: MetadataRoute.Sitemap = [];

  // Homepage
  sitemap.push({
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1,
  });

  // Página de fundamentos
  sitemap.push({
    url: `${BASE_URL}/fundamentos`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  });

  // Página de explorar (genérica)
  sitemap.push({
    url: `${BASE_URL}/explorar`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  });

  // Generar URLs para cada combinación dominio/país
  try {
    const jsonDir = path.join(process.cwd(), 'data', 'json');

    for (const dominio of DOMINIOS) {
      const dominioPath = path.join(jsonDir, dominio);
      
      if (!fs.existsSync(dominioPath)) continue;

      const files = fs.readdirSync(dominioPath).filter(f => f.endsWith('.json'));

      for (const file of files) {
        const pais = file.replace(/\.json$/i, '');
        
        // URL para cada combinación dominio/país
        sitemap.push({
          url: `${BASE_URL}/explorar?dominio=${dominio}&pais=${pais}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });

        // Para dominios agua y vertimientos, también incluir sectores si es posible
        if (dominio === 'agua' || dominio === 'vertimientos') {
          try {
            const fileContent = fs.readFileSync(path.join(dominioPath, file), 'utf8');
            const data = JSON.parse(fileContent);
            
            if (data.sectors && typeof data.sectors === 'object') {
              const sectores = Object.keys(data.sectors);
              
              // Limitar a sectores principales (no generar URLs para TODOS los sectores)
              sectores.slice(0, 5).forEach(sector => {
                sitemap.push({
                  url: `${BASE_URL}/explorar?dominio=${dominio}&pais=${pais}&sector=${sector}`,
                  lastModified: new Date(),
                  changeFrequency: 'monthly',
                  priority: 0.6,
                });
              });
            }
          } catch (error) {
            // Skip if file can't be parsed
            console.error(`Error parsing ${file}:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return sitemap;
}
