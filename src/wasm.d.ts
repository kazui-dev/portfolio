// Type declarations for .wasm imports (handled as WebAssembly.Module by @cloudflare/vite-plugin)
declare module '*.wasm' {
  const module: WebAssembly.Module
  export default module
}
