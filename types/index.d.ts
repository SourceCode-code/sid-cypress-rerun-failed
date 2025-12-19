declare module "sid-cypress-rerun-failed" {
  import { PluginEvents, PluginConfigOptions } from "cypress";

  type CypressPlugin = (
    on: PluginEvents,
    config: PluginConfigOptions
  ) => void;

  const rerunFailed: CypressPlugin;

  export function getFailedSpecs(reportDir: string): string[];

  export default rerunFailed;
}
