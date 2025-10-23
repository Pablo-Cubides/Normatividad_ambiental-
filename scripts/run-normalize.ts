import path from 'path';
import fs from 'fs';
import { normalizeData, mergeCandidates } from '../src/lib/utils';
import { normalizeResponseFormat } from '../src/app/api/normas/route';

function runFor(country: string, domain = 'agua') {
  const filePath = path.join(process.cwd(), 'data', 'json', domain, `${country.toLowerCase()}.json`);
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return;
  }
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const countryData = JSON.parse(fileContent);
  const normalized = normalizeData(countryData);
  const merged = mergeCandidates(normalized, domain, country);
  const out = normalizeResponseFormat(merged as unknown as Record<string, unknown>, domain, country);

  console.log(`\n== ${country} / ${domain} ==`);
  if (out._sectors) {
    for (const key of Object.keys(out._sectors)) {
      const s = out._sectors[key] as any;
      const ns = s?.normativeSources ? (s.normativeSources as any[]).map((x:any) => ({ name: x.name, url: x.url })) : [];
      console.log(`${key}: normativeSources=${ns.length} normativeUrl=${s?.normativeUrl ?? '<none>'} normativeReference=${s?.normativeReference ?? s?.normativeReference_es ?? '<none>'}`);
    }
  } else {
    console.log('No sectors in normalized output. Top normativeReference:', out.normativeReference || out.normativeReference_es || '<none>');
  }
}

runFor('brasil', 'agua');
runFor('estados-unidos', 'agua');
