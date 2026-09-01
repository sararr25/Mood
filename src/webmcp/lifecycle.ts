import { create } from 'zustand'

export type RegistrationState = 'unsupported' | 'registering' | 'ready' | 'error'
export type WebMcpDebugState = {
  apiDetected: boolean
  modelContextAvailable: boolean
  registerToolAvailable: boolean
  registrationState: RegistrationState
  expectedToolCount: number
  registeredToolCount: number
  registeredToolNames: string[]
  registrationErrors: string[]
  browserTools: unknown[]
  selfTest: { ok: boolean; detail: string } | null
  executions: Array<{ tool: string; success: boolean; beforeVersion: number; afterVersion: number; detail: string }>
}

export const useWebMcpLifecycleStore = create<WebMcpDebugState>(() => ({
  apiDetected: false, modelContextAvailable: false, registerToolAvailable: false,
  registrationState: 'unsupported', expectedToolCount: 0, registeredToolCount: 0,
  registeredToolNames: [], registrationErrors: [], browserTools: [], selfTest: null, executions: []
}))

export const webMcpLifecycle = {
  begin(expectedToolCount: number, detected: { context: boolean; registerTool: boolean }) {
    useWebMcpLifecycleStore.setState({ apiDetected: detected.context, modelContextAvailable: detected.context, registerToolAvailable: detected.registerTool, registrationState: detected.registerTool ? 'registering' : 'unsupported', expectedToolCount, registeredToolCount: 0, registeredToolNames: [], registrationErrors: [], browserTools: [], selfTest: null, executions: [] })
  },
  registered(name: string) { useWebMcpLifecycleStore.setState((state) => ({ registeredToolCount: state.registeredToolCount + 1, registeredToolNames: [...state.registeredToolNames, name] })) },
  failed(name: string, error: unknown) { useWebMcpLifecycleStore.setState((state) => ({ registrationErrors: [...state.registrationErrors, `${name}: ${error instanceof Error ? error.message : String(error)}`] })) },
  finish(browserTools: unknown[] = []) { useWebMcpLifecycleStore.setState((state) => ({ browserTools, registrationState: state.registrationErrors.length === 0 && state.registeredToolCount === state.expectedToolCount ? 'ready' : 'error' })) },
  setSelfTest(ok: boolean, detail: string) { useWebMcpLifecycleStore.setState({ selfTest: { ok, detail } }) }
  ,executed(tool: string, success: boolean, beforeVersion: number, afterVersion: number, detail: string) { useWebMcpLifecycleStore.setState((state) => ({ executions: [{ tool, success, beforeVersion, afterVersion, detail }, ...state.executions].slice(0, 10) })) }
}

type ToolContext = { executeTool?: (...args: unknown[]) => Promise<unknown> }
export const runWebMcpSelfTest = async () => {
  const state = useWebMcpLifecycleStore.getState()
  const context = (document as Document & { modelContext?: ToolContext }).modelContext
  if (!state.modelContextAvailable || !state.registerToolAvailable) return webMcpLifecycle.setSelfTest(false, 'document.modelContext.registerTool is unavailable.')
  if (state.registrationState !== 'ready') return webMcpLifecycle.setSelfTest(false, `Registration is ${state.registrationState}; inspect errors below.`)
  if (typeof context?.executeTool === 'function') {
    try { await context.executeTool('get_project_context', {}); return webMcpLifecycle.setSelfTest(true, 'API, registration, and get_project_context execution passed.') } catch (firstError) {
      try { await context.executeTool({ name: 'get_project_context', input: {} }); return webMcpLifecycle.setSelfTest(true, 'API, registration, and get_project_context execution passed.') } catch (secondError) { return webMcpLifecycle.setSelfTest(false, `executeTool failed in both supported call shapes: ${describeError(firstError)}; ${describeError(secondError)}`) }
    }
  }
  webMcpLifecycle.setSelfTest(true, 'API and all registrations are ready. This host does not expose executeTool for an in-page call.')
}

const describeError = (error: unknown) => error instanceof Error ? error.message : typeof error === 'object' ? JSON.stringify(error) : String(error)
