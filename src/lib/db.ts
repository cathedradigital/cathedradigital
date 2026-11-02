/**
 * Ponte de tipagem da clonagem da Cathedra Digital.
 *
 * O schema original (159 tabelas) está sendo aplicado no Lovable Cloud em 20
 * lotes de migração. Enquanto ele não estiver completo, o `Database` gerado em
 * `src/integrations/supabase/types.ts` não conhece as tabelas ainda ausentes e
 * o supabase-js resolve `.from('x')` como `never`, travando o build inteiro.
 *
 * Este módulo reexporta o MESMO cliente gerado, apenas com a tipagem relaxada,
 * para que as telas clonadas compilem durante a migração. Não há mudança de
 * runtime: é exatamente o cliente de `@/integrations/supabase/client`, com a
 * mesma sessão, a mesma chave publicável e a mesma RLS.
 *
 * Os enums continuam vindo do schema real (o lote 1 já os criou), então
 * `Enums<'app_role'>` e afins permanecem verificados pelo compilador.
 *
 * Quando os 20 lotes estiverem aplicados, este arquivo pode voltar a apontar
 * para os tipos gerados, sem tocar nas telas.
 */
import { supabase as generatedClient } from '../integrations/supabase/client';
import type { Database as GeneratedDatabase, Json } from '../integrations/supabase/types';

/* eslint-disable @typescript-eslint/no-explicit-any */

export type { Json };

/** Resultado de qualquer query enquanto o schema está incompleto. */
type LooseResult = {
  data: any;
  error: any;
  count: number | null;
  status: number;
  statusText: string;
};

/**
 * Query builder relaxado. Cada método encadeável devolve o próprio builder e o
 * `await` resolve em `{ data, error }`, preservando o encadeamento do PostgREST.
 */
type LooseQuery = {
  then: PromiseLike<LooseResult>['then'];
  select: (...args: any[]) => LooseQuery;
  insert: (...args: any[]) => LooseQuery;
  update: (...args: any[]) => LooseQuery;
  upsert: (...args: any[]) => LooseQuery;
  delete: (...args: any[]) => LooseQuery;
  eq: (...args: any[]) => LooseQuery;
  neq: (...args: any[]) => LooseQuery;
  gt: (...args: any[]) => LooseQuery;
  gte: (...args: any[]) => LooseQuery;
  lt: (...args: any[]) => LooseQuery;
  lte: (...args: any[]) => LooseQuery;
  like: (...args: any[]) => LooseQuery;
  ilike: (...args: any[]) => LooseQuery;
  is: (...args: any[]) => LooseQuery;
  in: (...args: any[]) => LooseQuery;
  contains: (...args: any[]) => LooseQuery;
  containedBy: (...args: any[]) => LooseQuery;
  overlaps: (...args: any[]) => LooseQuery;
  textSearch: (...args: any[]) => LooseQuery;
  match: (...args: any[]) => LooseQuery;
  not: (...args: any[]) => LooseQuery;
  or: (...args: any[]) => LooseQuery;
  and: (...args: any[]) => LooseQuery;
  filter: (...args: any[]) => LooseQuery;
  order: (...args: any[]) => LooseQuery;
  limit: (...args: any[]) => LooseQuery;
  range: (...args: any[]) => LooseQuery;
  single: (...args: any[]) => LooseQuery;
  maybeSingle: (...args: any[]) => LooseQuery;
  csv: (...args: any[]) => LooseQuery;
  geojson: (...args: any[]) => LooseQuery;
  explain: (...args: any[]) => LooseQuery;
  rollback: (...args: any[]) => LooseQuery;
  returns: (...args: any[]) => LooseQuery;
  abortSignal: (...args: any[]) => LooseQuery;
  throwOnError: (...args: any[]) => LooseQuery;
  setHeader: (...args: any[]) => LooseQuery;
};

/** Cliente com nomes de tabela/RPC ainda não presentes no schema gerado. */
type LooseClient = Omit<typeof generatedClient, 'from' | 'rpc' | 'schema'> & {
  from: (table: string) => LooseQuery;
  rpc: (fn: string, args?: Record<string, any>, opts?: Record<string, any>) => LooseQuery;
  schema: (name: string) => { from: (table: string) => LooseQuery; rpc: LooseClient['rpc'] };
};

export const supabase = generatedClient as unknown as LooseClient;

export default supabase;

// ————————————————————————————————————————————————————————————————
// Helpers de tipo equivalentes aos gerados, com tabelas relaxadas.
// ————————————————————————————————————————————————————————————————

type LooseTable = {
  Row: Record<string, any>;
  Insert: Record<string, any>;
  Update: Record<string, any>;
  Relationships: any;
};

export type Database = Omit<GeneratedDatabase, 'public'> & {
  public: Omit<GeneratedDatabase['public'], 'Tables' | 'Views' | 'Functions'> & {
    Tables: Record<string, LooseTable>;
    Views: Record<string, LooseTable>;
    Functions: Record<string, { Args: Record<string, any>; Returns: any }>;
  };
};

/** Linha de uma tabela ainda não presente no schema gerado. */
export type Tables<_Name extends string = string> = Record<string, any>;
export type TablesInsert<_Name extends string = string> = Record<string, any>;
export type TablesUpdate<_Name extends string = string> = Record<string, any>;

/** Enums vêm do schema real — já aplicados pelo lote 1. */
export type Enums<Name extends keyof GeneratedDatabase['public']['Enums']> =
  GeneratedDatabase['public']['Enums'][Name];
