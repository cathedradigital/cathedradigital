// Compatibilidade de rota: a Home pública e o Átrio usam uma única implementação.
// A experiência oficial fica em HomeUnified para evitar duas Homes concorrentes.
export { default } from './HomeUnified';
