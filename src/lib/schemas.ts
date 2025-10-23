import { z } from 'zod';

// Minimal schemas to validate the basic shapes used by the app.

export const ReferenceSchema = z.object({
	norma: z.string().optional(),
	entidad: z.string().optional(),
	anio: z.union([z.string(), z.number()]).optional(),
	url: z.string().optional(),
});

export const RecordSchema = z.object({
	parameter: z.string().optional(),
	parametro: z.string().optional(),
	limit: z.string().optional(),
	limite: z.string().optional(),
	unit: z.string().nullable().optional(),
	unidad: z.string().nullable().optional(),
	notes: z.array(z.string()).optional(),
	notas: z.array(z.string()).optional(),
	reference: ReferenceSchema.optional(),
	categoria: z.string().optional(),
});

export const SectorSchema = z.object({
	name: z.string().optional(),
	descripcion: z.string().optional(),
	description: z.string().optional(),
	normativeReference: z.string().optional(),
	parameters: z.array(RecordSchema).optional(),
});

export const SectorsRecord = z.record(z.string(), SectorSchema).optional();

export const UnifiedNormSchema = z.object({
	domain: z.string().optional(),
	country: z.string().optional(),
	pais: z.string().optional(),
	version: z.string().optional(),
	lastUpdate: z.string().optional(),
	normativeReference: z.string().optional(),
	normativeReference_es: z.string().optional(),
	records: z.array(RecordSchema).optional(),
	registros: z.array(RecordSchema).optional(),
		sectors: SectorsRecord,
});

export type RecordNorm = z.infer<typeof RecordSchema>;
export type SectorNorm = z.infer<typeof SectorSchema>;
export type UnifiedNorm = z.infer<typeof UnifiedNormSchema>;

export default UnifiedNormSchema;